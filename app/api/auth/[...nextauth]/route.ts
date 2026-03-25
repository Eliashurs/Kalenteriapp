import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Kirjautuminen",
      credentials: {
        username: { label: "Käyttäjätunnus", type: "text" },
        password: { label: "Salasana", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.username === "admin" && credentials?.password === "viitasaari123") {
          return { id: "1", name: "Admin", email: "admin@example.com" };
        }
        return null;
      }
    })
  ],
  // POISTA TÄMÄ RIVI TAI KOMMENTOI SE:
   pages: { signIn: '/auth/signin' }, 
  
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };