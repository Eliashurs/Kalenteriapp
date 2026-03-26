'use client';

import { useForm } from '@mantine/form';
import { TextInput, PasswordInput, Button, Paper, Title, Text, Container, Box } from "@mantine/core";
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },
    validate: {
      username: (value) => (value.length < 2 ? 'Käyttäjätunnus on liian lyhyt' : null),
      password: (value) => (value.length < 5 ? 'Salasana on liian lyhyt' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);
    
    // Yritetään kirjautua NextAuthin credentials-providerilla
    const result = await signIn('credentials', {
      redirect: false, // Ei ohjata automaattisesti, jotta voimme käsitellä virheet
      username: values.username,
      password: values.password,
      callbackUrl: '/', // Mihin ohjataan onnistuneen kirjautumisen jälkeen
    });

    setLoading(false);

    if (result?.error) {
      setError('Väärä käyttäjätunnus tai salasana');
    } else if (result?.ok) {
      router.push(result.url || '/'); // Ohjataan etusivulle
    }
  };

  return (
    <Container size={420} my={80}>
      <Title ta="center" order={1} style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
        Kirjaudu sisään
      </Title>
      
      <Text c="dimmed" size="sm" ta="center" mb={30}>
        Päästäksesi hallitsemaan varauksia
      </Text>

      {error && (
        <Paper withBorder p="md" mb="xl" style={{ borderColor: 'red', backgroundColor: '#fff5f5' }}>
          <Text c="red" ta="center">{error}</Text>
        </Paper>
      )}

      <Paper withBorder shadow="md" p={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput 
            label="Käyttäjätunnus" 
            placeholder="Kirjoita käyttäjätunnus" 
            required 
            {...form.getInputProps('username')} 
          />
          <PasswordInput 
            label="Salasana" 
            placeholder="Kirjoita salasana" 
            required 
            mt="md" 
            {...form.getInputProps('password')} 
          />
          <Button 
            fullWidth 
            mt="xl" 
            type="submit" 
            loading={loading}
            color="dark" // Sopii mustaan teemaan
          >
            Kirjaudu
          </Button>
        </form>
      </Paper>
    </Container>
  );
}