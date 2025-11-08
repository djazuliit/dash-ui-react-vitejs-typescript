// import node module libraries
import { Row, Col, Card, Form, Button, Image, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useState, ChangeEvent, FormEvent } from "react";

// import api
import api from "../../api/axios";

const ForgotPassword = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Email harus diisi');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', {
        email: email
      });

      setSuccess(res.data.message || 'Link reset password telah dikirim ke email Anda');
      
      // Redirect ke halaman konfirmasi setelah 2 detik
      setTimeout(() => {
        navigate('/auth/forgot-password-confirm', { 
          state: { email } 
        });
      }, 2000);

    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || 'Terjadi kesalahan');
      } else {
        setError('Terjadi kesalahan saat memproses permintaan');
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
              <p className="text-muted mb-4">
                Masukkan email Anda untuk reset password
              </p>
            </div>

            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert variant="success" className="mb-3">
                {success}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4" controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Masukkan alamat email Anda"
                  value={email}
                  onChange={handleEmailChange}
                  required
                />
                <Form.Text className="text-muted">
                  Kami akan mengirim link reset password ke email ini
                </Form.Text>
              </Form.Group>

              <div className="d-grid mb-3">
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={loading}
                  className="fw-bold"
                >
                  {loading ? 'Mengirim...' : 'Kirim Link Reset'}
                </Button>
              </div>

              <div className="text-center">
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

export default ForgotPassword;