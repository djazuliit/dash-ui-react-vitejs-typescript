// import node module libraries
import { Row, Col, Card, Form, Button, Image, Alert } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";

// import api
import api from "../../api/axios";

// Define types untuk location state
interface LocationState {
  email: string;
  message: string;
}

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [otp, setOtp] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    // Type assertion untuk location state
    const state = location.state as LocationState;
    if (state?.email) {
      setEmail(state.email);
    }
    if (state?.message) {
      setMessage(state.message);
    }
  }, [location]);

  const handleOtpChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Hanya angka
    setOtp(value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Kode OTP harus 6 digit');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/verify-otp', {
        email: email,
        otp: otp
      });

      // Jika verifikasi berhasil
      navigate('/auth/sign-in', { 
        state: { 
          message: 'Verifikasi berhasil! Silakan login.' 
        } 
      });

    } catch (err: unknown) {
      // Type guard untuk error handling
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || 'Verifikasi gagal');
      } else {
        setError('Terjadi kesalahan saat verifikasi');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    
    if (!email) {
      setError('Email tidak ditemukan, silakan daftar ulang');
      return;
    }

    setLoading(true);

    try {
      // Endpoint untuk resend OTP (anda perlu menambahkan ini di backend)
      const res = await api.post('/auth/resend-otp', { email });
      
      setMessage('Kode OTP baru telah dikirim ke email Anda');
      
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || 'Gagal mengirim ulang OTP');
      } else {
        setError('Gagal mengirim ulang OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row className="align-items-center justify-content-center g-0 min-vh-100 bg-light">
      <Col xxl={4} lg={6} md={8} xs={12} className="py-8 py-xl-0">
        <Card className="smooth-shadow-md border-0">
          <Card.Body className="p-6">
            <div className="text-center mb-4">
              <Link to="/">
                <Image
                  src="/images/brand/logo/logo-primary.svg"
                  className="mb-3"
                  alt="Logo"
                  height={40}
                />
              </Link>
              <p className="text-muted mb-4">Verifikasi OTP</p>
            </div>

            {message && (
              <Alert variant="info" className="mb-3">
                {message}
              </Alert>
            )}

            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  readOnly
                  className="bg-light"
                />
                <Form.Text className="text-muted">
                  Kode OTP dikirim ke email ini
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3" controlId="otp">
                <Form.Label>Kode OTP</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Masukkan 6 digit kode OTP"
                  value={otp}
                  onChange={handleOtpChange}
                  maxLength={6}
                  required
                  pattern="[0-9]{6}"
                  title="Masukkan 6 digit angka"
                />
                <Form.Text className="text-muted">
                  Cek inbox atau spam folder di email Anda
                </Form.Text>
              </Form.Group>

              <div className="d-grid mb-3">
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="fw-bold"
                >
                  {loading ? 'Memverifikasi...' : 'Verifikasi OTP'}
                </Button>
              </div>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-decoration-none p-0"
                >
                  Kirim ulang kode OTP
                </Button>
              </div>

              <div className="text-center mt-3">
                <Link to="/auth/sign-in" className="text-inherit fs-6">
                  Kembali ke Login
                </Link>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default VerifyOtp;