export default {
  jwt: {
    secret: process.env.JWT_SECRET as string || "aaaaaaaaaaaaaaaaaaaaaa",
    expiresIn: '1d'
  }
}
