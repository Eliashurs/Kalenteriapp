'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import { Button, Group, Text } from "@mantine/core";

export function AuthButtons() {
  const { data: session } = useSession();

  if (session) {
    return (
      <Group gap="xs">
        <Text size="xs" c="dimmed">Ylläpito: {session.user?.name}</Text>
        <Button 
          variant="subtle" 
          color="gray" 
          size="compact-xs" 
          onClick={() => signOut()}
        >
          Kirjaudu ulos
        </Button>
      </Group>
    );
  }

  return (
    <Button 
      variant="outline" 
      color="white" 
      size="xs" 
      radius="xl"
      onClick={() => signIn()}
      style={{ opacity: 0.7 }}
    >
      Ylläpitäjä? Kirjaudu sisään
    </Button>
  );
}