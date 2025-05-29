import {
    Alert,
    Box,
    Button,
    Container,
    Grid,
    Paper,
    Snackbar,
    TextField,
    Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);

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

        try {
            // 实际项目中，这里应该调用API进行注册
            // const response = await registerUser(formData);

            // 模拟成功注册
            console.log('用户注册成功', formData);

            // 注册成功后跳转到登录页面
            navigate('/login');
        } catch (error) {
            setError('注册失败，请稍后再试');
            setOpen(true);
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
                            <Grid xs={12}>
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

                            <Grid xs={12}>
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

                            <Grid xs={12}>
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

                            <Grid xs={12}>
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
                            sx={{ mt: 3, mb: 2 }}
                        >
                            注册
                        </Button>

                        <Grid container justifyContent="flex-end">
                            <Grid>
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
