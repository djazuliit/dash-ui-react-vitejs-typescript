// import node module libraries
import { Row, Col, Card, Image, Alert } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

interface LocationState {
  email: string;
}

const ForgotPasswordConfirm = () => {
  const location = useLocation();
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    const state = location.state as LocationState;
    if (state?.email) {
      setEmail(state.email);
    }
  }, [location]);

  return (
    <Row className="align-items-center justify-content-center g-0 min-vh-100 bg-light">
      <Col xxl={4} lg={6} md={8} xs={12} className="py-8 py-xl-0">
        <Card className="smooth-shadow-md border-0">
          <Card.Body className="p-6 text-center">
            <div className="mb-4">
              <Link to="/">
                <Image
                  src="/images/brand/logo/logo-primary.svg"
                  className="mb-3"
                  alt="Logo"
                  height={40}
                />
              </Link>
            </div>

            <Alert variant="success" className="mb-4">
              <Alert.Heading>Link Reset Terkirim!</Alert.Heading>
              <p className="mb-0">
                Kami telah mengirim link reset password ke email:
                <br />
                <strong>{email}</strong>
              </p>
            </Alert>

            <div className="mb-4">
              <p className="text-muted">
                Silakan cek inbox email Anda dan klik link yang kami kirimkan 
                untuk melanjutkan proses reset password.
              </p>
              <p className="text-muted mb-0">
                Jika tidak menemukan email, periksa folder spam atau junk mail.
              </p>
            </div>

            <div className="d-grid gap-2">
              <Link to="/auth/sign-in" className="btn btn-primary">
                Kembali ke Login
              </Link>
              <Link to="/auth/forgot-password" className="btn btn-outline-primary">
                Kirim Ulang Link
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default ForgotPasswordConfirm;