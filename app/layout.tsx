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
} from "@mantine/core";
import { theme } from "../theme";

// Määritellään Dancing Script -fontti ja sen painot
const dancingScript = Dancing_Script({ 
  subsets: ['latin'],
  weight: ['400', '700'], // Ladataan normaali ja paksu versio
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
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme}>
          {children}
          
          <Box
            style={{
              backgroundColor: '#1a1a1a',
              width: '100%',
              padding: '24px 24px', // Hieman korkeampi palkki
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
            {/* VIITASAARI - Otsikko */}
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

            {/* Pikkasen parempi periferia - Kauno-fontti */}
            <Text
              style={{
                color: '#ffffff',
                // Käytetään Next.js fonttia suoraan inline-tyylissä
                fontFamily: dancingScript.style.fontFamily,
                fontSize: '1.6rem', // Kaunofontti tarvitsee reilusti kokoa
                fontWeight: 700,    // Tehdään siitä paksumpi
                marginTop: '4px',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'optimizeLegibility',
              }}
            >
              Pikkasen parempi periferia
            </Text>
          </Box>
        </MantineProvider>
      </body>
    </html>
  );
}