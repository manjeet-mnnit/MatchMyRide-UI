import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/useUser.js'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import axios from '../api/axiosInstance.js'

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [message, setMessage] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()
    const { isAuthenticated, loading, login } = useUser()

    useEffect(() => {
        if (!loading && isAuthenticated) {
            navigate('/', { replace: true })
        }
    }, [isAuthenticated, loading, navigate])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const res = await axios.post('/users/login', formData)

            login(res.data)
            
            setMessage(res.data.message)
        } catch (err) {
            setMessage(err.response?.data?.message || 'Login failed')
        }
		finally {
			setIsSubmitting(false)
		}
    }

    return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-100 to-purple-100 flex items-center justify-center px-4">
			<div className="w-full max-w-lg bg-white shadow-lg rounded-2xl p-8">
				<img src="../../public/logo.png" className='mx-auto h-12 w-auto mb-6'></img>
				<h3 className='text-2xl text-left text-gray mt-8 font-semibold'>Welcome back!</h3>
				<p className='text-md text-left text-gray-600 mb-8'>Sign in to plan your next ride</p>
				{message && (
					<p className="text-center text-red-500 mb-4">{message}</p>
				)}
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="relative">
						<Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
						<input
							name="email"
							type="email"
							placeholder="Email"
							value={formData.email}
							onChange={handleChange}
							className="w-full pl-10 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
							required
						/>
					</div>
					<div className="relative">
						<Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
						<input
							name="password"
							type={showPassword ? "text" : "password"}
							placeholder="Password"
							value={formData.password}
							onChange={handleChange}
							className="w-full pl-10 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
							required
						/>
						<div
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 hover:cursor-pointer hover:text-gray-600"
						>
							{showPassword ? <EyeOff /> : <Eye />}
						</div>
					</div>
					<button
						disabled={isSubmitting}
						type="submit"
						className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md hover:cursor-pointer transition disabled:bg-gray-400 disabled:hover:bg-blue-400"
					>
						{isSubmitting ? 'Logging in...' : 'Login'}
					</button>
				</form>
				<div className="text-center mt-6">
					<span className="text-sm text-gray-600">Don't have an account?</span>
					<button
						onClick={() => navigate('/register')}
						className="ml-2 text-blue-600 hover:underline text-sm hover:cursor-pointer"
					>
						Sign up
					</button>
				</div>
			</div>
		</div>
	)
}