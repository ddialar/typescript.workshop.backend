export interface LoginInputParams {
  username: string
  password: string
}

export interface JwtPayload {
  sub: string
  username: string
}

export interface DecodedJwtToken extends JwtPayload {
  exp: number
  iat: number
}
