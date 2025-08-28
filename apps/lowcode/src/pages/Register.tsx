import { useAuth } from '@corn12138/hooks';
import {
    Alert,
    Box,
    Button,
    Container,
    Paper,
    Snackbar,
    TextField,
    Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 基本验证
        if (!formData.username || !formData.email || !formData.password) {
            setError('所有字段都是必填的');
            setOpen(true);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('两次密码输入不一致');
            setOpen(true);
            return;
        }

        if (formData.password.length < 6) {
            setError('密码至少需要6个字符');
            setOpen(true);
            return;
        }

        setIsLoading(true);

        try {
            const success = await register({
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            if (success) {
                toast.success('注册成功！正在跳转...');
                navigate('/', { replace: true });
            } else {
                setError('注册失败，请检查输入信息');
                setOpen(true);
            }
        } catch (error) {
            console.error('Registration failed:', error);
            const errorMessage = error instanceof Error ? error.message : '注册失败，请稍后再试';
            setError(errorMessage);
            setOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
                    <Typography component="h1" variant="h5" align="center" gutterBottom>
                        注册账号
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    name="username"
                                    required
                                    fullWidth
                                    id="username"
                                    label="用户名"
                                    autoFocus
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="email"
                                    label="电子邮箱"
                                    name="email"
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="password"
                                    label="密码"
                                    type="password"
                                    id="password"
                                    autoComplete="new-password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="confirmPassword"
                                    label="确认密码"
                                    type="password"
                                    id="confirmPassword"
                                    autoComplete="new-password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </Grid>
                        </Grid>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={isLoading}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {isLoading ? '注册中...' : '注册'}
                        </Button>

                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link to="/login">
                                    已有账号？点击登录
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </Box>

            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Register;
