import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import React from "react";
import { Dancing_Script } from 'next/font/google';
import {
  MantineProvider,
  ColorSchemeScript,
  mantineHtmlProps,
  Box,
  Text,
  Group,
} from "@mantine/core";
import { theme } from "../theme";
import { Providers } from "../components/Providers";
import { AuthButtons } from "../components/AuthButtons"; // Luodaan tämä seuraavaksi

const dancingScript = Dancing_Script({ 
  subsets: ['latin'],
  weight: ['400', '700'],
});

export const metadata = {
  title: "Varauskalenteri",
  description: "Varaa sopiva aika kalenterista",
};

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/" />
      </head>
      <body>
        <Providers>
          <MantineProvider theme={theme}>
            {/* Sisältö (kalenteri) */}
            <Box style={{ paddingBottom: '160px' }}>
               {children}
            </Box>
            
            {/* Alapalkki */}
            <Box
              style={{
                backgroundColor: '#1a1a1a',
                width: '100%',
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'fixed',
                bottom: 0,
                left: 0,
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
                boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)',
                zIndex: 1000,
              }}
            >
              <Text
                style={{
                  color: '#ffffff',
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  fontFamily: 'Impact, Arial Black, sans-serif',
                  lineHeight: 1,
                }}
              >
                Viitasaari
              </Text>

              <Text
                style={{
                  color: '#ffffff',
                  fontFamily: dancingScript.style.fontFamily,
                  fontSize: '1.6rem',
                  fontWeight: 700,
                  marginTop: '4px',
                  WebkitFontSmoothing: 'antialiased',
                }}
              >
                Pikkasen parempi periferia
              </Text>

              {/* Kirjautumisnappi lisätty tänne */}
              <Box mt="md">
                <AuthButtons />
              </Box>
            </Box>
          </MantineProvider>
        </Providers>
      </body>
    </html>
  );
}