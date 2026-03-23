'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Container, Title, Text, SimpleGrid, Card, Button, 
  Stack, Divider, TextInput, Group, Notification, rem, Select, Box, Center, Badge 
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { 
  IconCheck, IconCalendarStats, IconBuilding, IconClock, 
  IconHourglassHigh, IconTrash 
} from '@tabler/icons-react';
import { get } from 'http';

interface Booking {
  id: string;
  date: string; // ISO string
  time: string;
  duration: string;
  name: string;
  email: string;
}

export default function BookingPage() {
  // Varaukset
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  // Form state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [duration, setDuration] = useState<string>('1');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);

  const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

  // Lataa varaukset local storagesta
  useEffect(() => {
    const saved = localStorage.getItem('bookings');
    if (saved) {
      setBookings(JSON.parse(saved));
    }
  }, []);

  // Tallenna varaukset local storageen
  const saveBooking = (newBooking: Booking) => {
    const updated = [...bookings, newBooking];
    setBookings(updated);
    localStorage.setItem('bookings', JSON.stringify(updated));
  };

  // Poista varaus
  const deleteBooking = (id: string) => {
    const updated = bookings.filter(b => b.id !== id);
    setBookings(updated);
    localStorage.setItem('bookings', JSON.stringify(updated));
  };

  // Hae päivän varaukset
  const getDayBookings = (date: Date | null): Booking[] => {
    if (!date) return [];
    const d = date instanceof Date ? date : new Date(date);
    const dateStr = d.toISOString().split('T')[0];
    return bookings.filter(b => b.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));
  };

  // Laske loppumisaika
  const calculateEndTime = (startTime: string, duration: string): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + parseFloat(duration) * 60;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const dayBookings = useMemo(() => getDayBookings(selectedDate), [selectedDate, bookings, getDayBookings]);

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime || !name || !email) return;

    const d = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
    const newBooking: Booking = {
      id: Date.now().toString(),
      date: d.toISOString().split('T')[0],
      time: selectedTime,
      duration: duration || '1',
      name,
      email,
    };

    saveBooking(newBooking);
    
    // Tyhjennä form
    setSelectedTime(null);
    setDuration('1');
    setName('');
    setEmail('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 6000);
  };

  return (
    <Container size="md" py="xl">
      {submitted && (
        <Notification 
          icon={<IconCheck style={{ width: rem(20), height: rem(20) }} />} 
          color="teal" 
          title="Varaus onnistui!" 
          onClose={() => setSubmitted(false)}
          mb="xl"
        >
          Varauksesi on vahvistettu. Tervetuloa!
        </Notification>
      )}

      <Stack gap="xs" mb="xl" ta="center">
        <Title order={1} fw={800} c="orange" size="3rem">Viitasaari</Title>
        <Title order={2} fw={700}>🎵 Soittotilan varaus 🎵</Title>
        <Text c="dimmed">Valitse päivä, aloitusaika ja kesto.</Text>
      </Stack>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
        
        {/* 1. PÄIVÄMÄÄRÄ */}
        <Stack gap="md">
          <Card withBorder radius="md" p="lg" shadow="sm">
            <Group mb="md" gap="xs">
              <IconCalendarStats size={20} color="blue" />
              <Text fw={700}>1. Valitse päivämäärä</Text>
            </Group>
            <DatePicker 
              value={selectedDate} 
              onChange={(date) => setSelectedDate(date ? new Date(date) : null)} 
              size="md"
              minDate={new Date()}
              styles={{
                calendarHeaderControlIcon: {
                  width: rem(16),
                  height: rem(16),
                  minWidth: rem(16),
                  minHeight: rem(16),
                  maxWidth: rem(16),
                  maxHeight: rem(16),
                },
                calendarHeaderControl: {
                  '& svg': {
                    width: rem(16),
                    height: rem(16),
                    minWidth: rem(16),
                    minHeight: rem(16),
                  },
                },
              }}
            />
          </Card>

          <Button
            variant="light"
            color="orange"
            leftSection={<IconBuilding size={16} />}
            onClick={() => window.open('https://viitasaari.fi/kulttuuri-ja-vapaa-aika/kulttuuripalvelut/kulttuuritalokartano/', '_blank')}
            fullWidth
          >
            Lisätietoa Kulttuurikartanosta
          </Button>
        </Stack>

        {/* 2. AIKA JA KESTO */}
        <Stack gap="md">
          {selectedDate ? (
            <Card withBorder radius="md" p="lg" shadow="sm">
              <Stack gap="lg">
                <Box>
                  <Group mb="sm" gap="xs">
                    <IconClock size={20} color="blue" />
                    <Text fw={700}>2. Aloitusaika</Text>
                  </Group>
                  <SimpleGrid cols={4} spacing="xs">
                    {times.map((time) => (
                      <Button 
                        key={time} 
                        variant={selectedTime === time ? "filled" : "light"}
                        onClick={() => setSelectedTime(time)}
                        size="sm"
                        data-selected={selectedTime === time}
                      >
                        {time}
                      </Button>
                    ))}
                  </SimpleGrid>
                </Box>

                <Box>
                  <Group mb="sm" gap="xs">
                    <IconHourglassHigh size={20} color="blue" />
                    <Text fw={700}>3. Varauksen kesto (tunteina)</Text>
                  </Group>
                  <TextInput
                    type="number"
                    placeholder="esim. 2.5"
                    value={duration}
                    onChange={(e) => setDuration(e.currentTarget.value)}
                    min={0.5}
                    step={0.5}
                    required
                  />
                </Box>

                <Divider variant="dashed" />

                <Stack gap="sm">
                  <TextInput 
                    label="Nimi" 
                    placeholder="Oma nimesi" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.currentTarget.value)}
                  />
                  <TextInput 
                    label="Sähköposti" 
                    placeholder="matti@esimerkki.fi" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.currentTarget.value)}
                  />
                  
                  <Box bg="blue.0" p="md" style={{ borderRadius: rem(8) }} mt="sm">
                    <Text size="xs" c="blue.9" fw={700} tt="uppercase">Yhteenveto</Text>
                    <Text size="sm"><b>Päivä:</b> {selectedDate instanceof Date ? selectedDate.toLocaleDateString('fi-FI') : ''}</Text>
                    <Text size="sm"><b>Aika:</b> {selectedTime || '--:--'} - {selectedTime && duration ? calculateEndTime(selectedTime, duration) : '--:--'} ({duration || '0'} h)</Text>
                  </Box>

                  <Button 
                    color="blue" 
                    fullWidth 
                    size="lg" 
                    disabled={!selectedTime || !name || !email}
                    onClick={handleConfirm}
                  >
                    Vahvista varaus
                  </Button>
                </Stack>

                {dayBookings.length > 0 && (
                  <Stack gap="md" mt="xl">
                    <Divider />
                    <Text fw={700}>Tämän päivän varaukset ({dayBookings.length})</Text>
                    <Stack gap="sm">
                      {dayBookings.map((booking) => (
                        <Card key={booking.id} withBorder p="sm" bg="gray.0">
                          <Group justify="space-between">
                            <Stack gap="xs">
                              <Group gap="sm">
                                <Badge color="blue">{booking.time} - {calculateEndTime(booking.time, booking.duration)}</Badge>
                                <Text fw={500}>{booking.name}</Text>
                              </Group>
                              <Text size="sm" c="dimmed">
                                {booking.duration} h - {booking.email}
                              </Text>
                            </Stack>
                            <Button
                              variant="light"
                              color="red"
                              size="sm"
                              onClick={() => deleteBooking(booking.id)}
                              leftSection={<IconTrash size={16} />}
                            >
                              Poista
                            </Button>
                          </Group>
                        </Card>
                      ))}
                    </Stack>
                  </Stack>
                )}
              </Stack>
            </Card>
          ) : (
            <Center>
              <Text c="dimmed">Valitse päivämäärä nähdäksesi varausvaihtoehdot</Text>
            </Center>
          )}
        </Stack>
      </SimpleGrid>
    </Container>
  );
}