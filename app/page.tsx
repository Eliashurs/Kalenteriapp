'use client'

import { useState, useEffect, useMemo } from 'react';
import { BsMusicNoteList } from "react-icons/bs";
import { 
  Container, Title, Text, SimpleGrid, Card, Button, 
  Stack, Divider, TextInput, Group, Notification, rem, Box, Center, Badge 
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { 
  IconCheck, IconCalendarStats, IconBuilding, IconClock, 
  IconHourglassHigh, IconTrash 
} from '@tabler/icons-react';

// Tuodaan Firebase-asetukset
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';

interface Booking {
  id: string;
  date: string;
  time: string;
  duration: string;
  name: string;
  email: string;
}

export default function BookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [duration, setDuration] = useState<string>('1');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);

  const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

  // 1. REAALIAIKAINEN LATAUS FIREBASESTA
  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('time', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const bookingsArray: Booking[] = [];
      querySnapshot.forEach((doc) => {
        bookingsArray.push({ id: doc.id, ...doc.data() } as Booking);
      });
      setBookings(bookingsArray);
    });

    return () => unsubscribe();
  }, []);

  // 2. TALLENNUS FIREBASEEN
  const saveBooking = async (newBooking: Omit<Booking, 'id'>) => {
    try {
      await addDoc(collection(db, 'bookings'), newBooking);
    } catch (error) {
      console.error("Virhe tallennuksessa: ", error);
      alert("Tallennus epäonnistui!");
    }
  };

  // 3. POISTO FIREBASESTA
  const deleteBooking = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'bookings', id));
    } catch (error) {
      console.error("Virhe poistossa: ", error);
    }
  };

  const getDayBookings = (date: Date | null): Booking[] => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(b => b.date === dateStr);
  };

  const calculateEndTime = (startTime: string, duration: string): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + parseFloat(duration) * 60;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const dayBookings = useMemo(() => getDayBookings(selectedDate), [selectedDate, bookings]);

  // Helper: "HH:MM" -> minutes
  const toMin = (t: string): number => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  // Helper: minutes -> "HH:MM"
  const toTime = (m: number): string => {
    const h = Math.floor(m / 60).toString().padStart(2, '0');
    const min = (m % 60).toString().padStart(2, '0');
    return `${h}:${min}`;
  };

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime || !name || !email) return;

    const newBooking = {
      date: selectedDate.toISOString().split('T')[0],
      time: selectedTime,
      duration: duration || '1',
      name,
      email,
    };

    try {
      await saveBooking(newBooking);
      setSelectedTime(null);
      setDuration('1');
      setName('');
      setEmail('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 6000);
    } catch (err) {
      console.error("Havaittu virhe handleConfirmissa:", err);
    }
  };

  // Build booking list with free-time gap separators
  const renderBookingsWithGaps = () => {
    const sorted = [...dayBookings].sort((a, b) => toMin(a.time) - toMin(b.time));
    const items: React.ReactNode[] = [];

    sorted.forEach((booking, index) => {
      items.push(
        <Card key={booking.id} withBorder p="sm" bg="gray.0">
          <Group justify="space-between">
            <Stack gap="xs">
              <Group gap="sm">
                <Badge color="blue">
                  {booking.time} – {calculateEndTime(booking.time, booking.duration)}
                </Badge>
                <Text fw={500}>{booking.name}</Text>
              </Group>
              <Text size="sm" c="dimmed">{booking.duration} h</Text>
            </Stack>
            <Button 
              variant="subtle" 
              color="red" 
              size="xs" 
              onClick={() => deleteBooking(booking.id)}
              leftSection={<IconTrash size={14} />}
            >
              Poista
            </Button>
          </Group>
        </Card>
      );

      if (index < sorted.length - 1) {
        const currentEnd = toMin(booking.time) + Math.round(parseFloat(booking.duration) * 60);
        const nextStart = toMin(sorted[index + 1].time);
        const gapMin = nextStart - currentEnd;

        if (gapMin > 0) {
          items.push(
            <Group key={`gap-${index}`} gap="xs" align="center" px="xs">
              <Divider style={{ flex: 1 }} />
              <Badge variant="light" color="green" size="sm">
                Vapaa {toTime(currentEnd)}–{toTime(nextStart)} ({gapMin} min)
              </Badge>
              <Divider style={{ flex: 1 }} />
            </Group>
          );
        }
      }
    });

    return items;
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
          Varauksesi on tallennettu pilveen ja näkyy nyt kaikille.
        </Notification>
      )}

      <Stack gap="xs" mb="xl" ta="center">
        <Title order={1} fw={800} c="orange" size="3rem">Viitasaari</Title>
        <Title order={2} fw={700}> <BsMusicNoteList/> Bänditilan varaus </Title>
        <Text c="dimmed">Varaukset tallentuvat reaaliajassa yhteiseen kalenteriin.</Text>
      </Stack>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
        <Stack gap="md">
          <Card withBorder radius="md" p="lg" shadow="sm">
            <Group mb="md" gap="xs">
              <IconCalendarStats size={20} color="blue" />
              <Text fw={700}>1. Valitse päivämäärä</Text>
            </Group>
            <DatePicker 
              value={selectedDate} 
              onChange={(value) => {
                if (typeof value === 'string') {
                  setSelectedDate(new Date(value));
                } else {
                  setSelectedDate(value);
                }
              }} 
              size="md"
              minDate={new Date()}
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
                    value={duration}
                    onChange={(e) => setDuration(e.currentTarget.value)}
                    min={0.5}
                    step={0.5}
                    required
                  />
                </Box>

                <Divider variant="dashed" />

                <Stack gap="sm">
                  <TextInput label="Nimi" placeholder="Oma nimesi" required value={name} onChange={(e) => setName(e.currentTarget.value)} />
                  <TextInput label="Sähköposti" placeholder="matti@esimerkki.fi" required value={email} onChange={(e) => setEmail(e.currentTarget.value)} />
                  
                  <Box bg="blue.0" p="md" style={{ borderRadius: rem(8) }} mt="sm">
                    <Text size="xs" c="blue.9" fw={700} tt="uppercase">Yhteenveto</Text>
                    <Text size="sm"><b>Päivä:</b> {selectedDate.toLocaleDateString('fi-FI')}</Text>
                    <Text size="sm"><b>Aika:</b> {selectedTime || '--:--'} - {selectedTime && duration ? calculateEndTime(selectedTime, duration) : '--:--'}</Text>
                  </Box>

                  <Button color="blue" fullWidth size="lg" disabled={!selectedTime || !name || !email} onClick={handleConfirm}>
                    Vahvista varaus
                  </Button>
                </Stack>

                {dayBookings.length > 0 && (
                  <Stack gap="md" mt="xl">
                    <Divider />
                    <Text fw={700}>Päivän varaukset ({dayBookings.length})</Text>
                    {renderBookingsWithGaps()}
                  </Stack>
                )}
              </Stack>
            </Card>
          ) : (
            <Center h={200}>
              <Text c="dimmed">Valitse päivämäärä aloittaaksesi</Text>
            </Center>
          )}
        </Stack>
      </SimpleGrid>
    </Container>
  );
}
