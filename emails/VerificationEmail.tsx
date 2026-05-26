import { Html, Head, Font, Preview, Heading, Row, Section, Text } from "react-email";

interface VerificationEmailProps {
    username: string;
    otp: string;
}

export default function VerificationEmail({ username, otp }: VerificationEmailProps) {
    return (
        <Html lang="en" dir="ltr">
            <Head>
                <title>Verification Code</title>
                <Font
                    fontFamily="Roboto"
                    fallbackFontFamily="Verdana"
                    webFont={{
                        url: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap",
                        format: 'woff2'
                    }}
                    fontWeight={400}
                    fontStyle="normal"
                />
            </Head>
            <Preview>Your Mystry Message verification code: {otp}</Preview>
            <Section>
                <Row>
                    <Heading as="h2">Hello, {username}!</Heading>
                </Row>
                <Row>
                    <Text>
                        Thank you for registering with Mystry Message. Please use the following
                        verification code to complete your registration:
                    </Text>
                </Row>
                <Row>
                    <Text style={{
                        fontSize: '32px',
                        fontWeight: '700',
                        letterSpacing: '8px',
                        textAlign: 'center',
                        padding: '16px 24px',
                        background: '#f4f4f5',
                        borderRadius: '8px',
                        fontFamily: 'monospace'
                    }}>
                        {otp}
                    </Text>
                </Row>
                <Row>
                    <Text>
                        This code will expire in <strong>1 hour</strong>. If you did not request
                        this code, please ignore this email.
                    </Text>
                </Row>
            </Section>
        </Html>
    )
}
