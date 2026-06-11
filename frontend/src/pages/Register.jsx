import { useState, useEffect } from 'react'
import axios from '../api/axiosInstance.js'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/useUser.js'
import { User, Users, Mail, Lock, Eye, EyeOff, Mars, Venus, Phone, Camera } from 'lucide-react'

export default function Register(){
    const [formData, setFormData] = useState({
		fullName: '',
		email: '',
		password: '',
		gender: '',
		contactNumber: '',
		avatar: null,
	})
	const [showPassword, setShowPassword] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
    const [message, setMessage] = useState('')
	const navigate = useNavigate()
	const { isAuthenticated, loading } = useUser()

	useEffect(() => {
		if (!loading && isAuthenticated) {
			navigate('/', { replace: true })
		}
	}, [isAuthenticated, loading, navigate])

    const handleChange = (e) => {
		const { name, value } = e.target
		setFormData({ ...formData, [name]: value })
	}

    const handleFileChange = (e) => {
		setFormData({ ...formData, avatar: e.target.files[0] })
	}

    const handleSubmit = async (e) => {
		e.preventDefault()
		setIsSubmitting(true)
		const form = new FormData()
		Object.entries(formData).forEach(([key, val]) => {
			if (key === 'avatar' && val) form.append('avatar', val)
			else form.append(key, val)
		})

		try {
			const res = await axios.post('users/register', form)
			setMessage(res.data.message)
		} catch (err) {
			setMessage(err.response?.data?.message || 'Registration failed')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-white flex items-center justify-center px-4 py-8">
			<div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 sm:p-10">
				<h2 className="text-3xl sm:text-4xl font-semibold text-center text-gray-800 mb-6">
					Create Your Account
				</h2>
				{message && (
					<p className="mb-4 text-center text-sm text-red-600">{message}</p>
				)}
				<form disabled={isSubmitting} onSubmit={handleSubmit} className="space-y-5">
					<div className="relative">
						<User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
						<input
							name="fullName"
							type="text"
							placeholder="Full Name"
							value={formData.fullName}
							onChange={handleChange}
							className="w-full p-3 pl-11 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
							required
						/>
					</div>
					<div className="relative">
						<Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
						<input
							name="email"
							type="email"
							placeholder="Email"
							value={formData.email}
							onChange={handleChange}
							className="w-full p-3 pl-11 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
							required
						/>
					</div>
					<div className="relative">
						<Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
						<input
							name="password"
							type={showPassword ? 'text' : 'password'}
							placeholder="Password"
							value={formData.password}
							onChange={handleChange}
							className="w-full p-3 pl-11 pr-11 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
							required
						/>
						<button
							type="button"
							onClick={() => setShowPassword(v => !v)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
							tabIndex={-1}
							aria-label={showPassword ? 'Hide password' : 'Show password'}
						>
							{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
						</button>
					</div>
					<div>
						<p className="text-sm text-gray-500 mb-2">Gender</p>
						<div className="flex gap-3">
							<button
								type="button"
								onClick={() => setFormData({ ...formData, gender: 'Male' })}
								className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition ${
									formData.gender === 'Male'
										? 'border-blue-500 bg-blue-50 text-blue-600 ring-2 ring-blue-400'
										: 'border-gray-300 text-gray-500 hover:bg-gray-50'
								}`}
							>
								<User size={18} />
								<span className="text-sm font-medium">Male</span>
							</button>
							<button
								type="button"
								onClick={() => setFormData({ ...formData, gender: 'Female' })}
								className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition ${
									formData.gender === 'Female'
										? 'border-blue-500 bg-blue-50 text-blue-600 ring-2 ring-blue-400'
										: 'border-gray-300 text-gray-500 hover:bg-gray-50'
								}`}
							>
								<Users size={18} />
								<span className="text-sm font-medium">Female</span>
							</button>
						</div>
						<input type="hidden" name="gender" value={formData.gender} required />
					</div>
					<div className="relative">
						<Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
						<input
							name="contactNumber"
							type="text"
							placeholder="Contact Number"
							value={formData.contactNumber}
							onChange={handleChange}
							className="w-full p-3 pl-11 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
						/>
					</div>
					<div className="flex gap-3">
						<div className="flex-1 border-2 border-none rounded-xl  text-center bg-gray-50 hover:bg-gray-100 transition overflow-hidden">
							<input
								name="avatar"
								type="file"
								accept="image/*"
								onChange={handleFileChange}
								className="hidden"
								id="avatar-input"
							/>
							<label htmlFor="avatar-input" className="cursor-pointer">
								<button
									type="button"
									onClick={() => document.getElementById('avatar-input').click()}
									className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:cursor-pointer hover:bg-blue-600 transition duration-200 flex items-center justify-center gap-2"
								>
									<Camera size={18} />
									{formData.avatar ? formData.avatar.name : 'Choose Avatar'}
								</button>
							</label>
						</div>
						<button
							type="submit"
							disabled={isSubmitting}
							className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition duration-200 hover:cursor-pointer disabled:bg-gray-400 disabled:hover:bg-gray-400"
						>
							{isSubmitting ? 'Registering...' : 'Register'}
						</button>
					</div>
				</form>
				<div className="text-center mt-6">
					<span className="text-sm text-gray-600">Already have an account?</span>
					<button
						onClick={() => navigate('/login')}
						className="ml-2 text-blue-600 hover:underline text-sm hover:cursor-pointer"
					>
						Login
					</button>
				</div>
			</div>
		</div>
	)

}