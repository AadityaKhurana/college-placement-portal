import { useState } from "react";
import { getCurrentUser, loginUser, registerUser } from "./firebase/auth";
import { useRouter } from "next/router";
import { getDatabase, ref, set, get, child } from "firebase/database";
import Link from 'next/link';
import styles from '../styles/Home.module.css';

type UserType = 'student' | 'recruiter' | 'admin';
const db = getDatabase();


const Login = () => {
    const [showSignup, setShowSignup] = useState(false);
    const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);
    const [signupForm, setSignupForm] = useState({
        name: '',
        email: '',
        password: '',
        college: '',
        phone: '',
        skills: [],
        userType: '' as UserType
    });
    const router = useRouter();


    const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSignupForm(prev => ({
          ...prev,
          [name]: value,
          userType: selectedUserType || prev.userType
        }));
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await loginUser(signupForm.email, signupForm.password);
            // router.push("/student/dashboard"); // Redirect based on role
            var user = getCurrentUser();
            if (user) {
                // console.log("User logged in");
                const dbRef = ref(getDatabase());
                get(child(dbRef, `users/${user.uid}/role`)).then((snapshot) => {
                if (snapshot.exists()) {
                    if(snapshot.val() == "student") {
                        console.log("Student");
                        router.push("/student/dashboard");
                    } else if(snapshot.val() == "company") {
                        console.log("Company");
                        router.push("/company/dashboard");
                    } else if(snapshot.val() == "admin") {
                        console.log("Admin");
                        router.push("/admin/dashboard");
                    }
            }
            else {
                    console.log("No data available");
                }
                }).catch((error) => {
                    console.error(error);
                });
            } else {
                console.log("User is null");
            }
        } catch (err: any) {
            console.log(err.message);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await registerUser(signupForm.email, signupForm.password);
            var user = getCurrentUser();
            if (user) {
                // console.log("User registered");
                set(ref(db, 'users/'+user.uid+'/email'), signupForm.email);
                set(ref(db, 'users/'+user.uid+'/name'), signupForm.name);
                set(ref(db, 'users/'+user.uid+'/college'), signupForm.college);
                set(ref(db, 'users/'+user.uid+'/phone'), signupForm.phone);
                set(ref(db, 'users/'+user.uid+'/postings'), {"a": "b"});
                set(ref(db, 'users/'+user.uid+'/skills'), {0: "No skills added"});
                if(selectedUserType == "student") {
                    set(ref(db, 'users/'+user.uid+'/role'), "student");
                    router.push("/student/dashboard");
                } else if(selectedUserType == "recruiter") {
                    set(ref(db, 'users/'+user.uid+'/role'), "company");
                    router.push("/company/dashboard");
                } else if(selectedUserType == "admin") {
                    set(ref(db, 'users/'+user.uid+'/role'), "admin");
                    router.push("/admin/dashboard");
                }
            } else {
                console.log("User is null");
            }
                
        } catch (err: any) {
            console.log(err.message);
        }
    };

    return (
		<div className={styles.container}>
			<div className={styles.background}></div>
			<div className={styles.content}>
				<h1 className={styles.title}>Placement Platform</h1>
				
				<div className={styles.buttonGroup}>
					<button 
						className={styles.mainButton}
						onClick={() => {
							setShowSignup(true);
							setSelectedUserType(null);
						}}
					>
						Sign Up
					</button>
					
					<div className={styles.signinOptions}>
						<Link href="/student/signin" className={styles.link}>
							<button className={styles.signinButton}>
								Student Sign In
							</button>
						</Link>
						<Link href="/recruiter/signin" className={styles.link}>
							<button className={styles.signinButton}>
								Recruiter Sign In
							</button>
						</Link>
						<Link href="/admin/signin" className={styles.link}>
							<button className={styles.signinButton}>
								Admin Sign In
							</button>
						</Link>
					</div>
				</div>

				{showSignup && (
					<div className={styles.modal}>
						<div className={styles.modalContent}>
							<h2>Select User Type</h2>
							<div className={styles.userTypeSelect}>
								<button 
									className={`${styles.userTypeButton} ${selectedUserType === 'student' ? styles.selected : ''}`}
									onClick={() => setSelectedUserType('student')}
								>
									Student
								</button>
								<button 
									className={`${styles.userTypeButton} ${selectedUserType === 'recruiter' ? styles.selected : ''}`}
									onClick={() => setSelectedUserType('recruiter')}
								>
									Recruiter
								</button>
								<button 
									className={`${styles.userTypeButton} ${selectedUserType === 'admin' ? styles.selected : ''}`}
									onClick={() => setSelectedUserType('admin')}
								>
									Admin
								</button>
							</div>

							{selectedUserType && (
								<form onSubmit={handleSignUp} className={styles.signupForm}>
									<input
										type="text"
										name="name"
										placeholder="Full Name"
										value={signupForm.name}
										onChange={handleSignupChange}
										required
									/>
									<input
										type="email"
										name="email"
										placeholder="Email Address"
										value={signupForm.email}
										onChange={handleSignupChange}
										required
									/>
                                    <input
                                        type="tel"
										name="phone"
										placeholder="Phone number"
										value={signupForm.phone}
										onChange={handleSignupChange}
										required
									/>
                                    <input
										type="text"
										name="college"
										placeholder="College name"
										value={signupForm.college}
										onChange={handleSignupChange}
										required
									/>
									<input
										type="password"
										name="password"
										placeholder="Password"
										value={signupForm.password}
										onChange={handleSignupChange}
										required
									/>
									<button type="submit" className={styles.submitButton}>
										Sign Up as {selectedUserType.charAt(0).toUpperCase() + selectedUserType.slice(1)}
									</button>
								</form>
							)}
							
							<button 
								className={styles.closeButton}
								onClick={() => {
									setShowSignup(false);
									setSelectedUserType(null);
								}}
							>
								Close
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
    
    // return (
    // <div className="flex items-center justify-center h-screen bg-gray-100">
    //     <form className="bg-white p-6 rounded shadow-md w-full max-w-sm">
    //     <h1 className="text-xl font-semibold mb-4">Login</h1>
    //     {error && <p className="text-red-500 mb-3">{error}</p>}
    //     <input
    //         type="text"
    //         placeholder="Name (Not required if logging in)"
    //         className="border p-2 w-full mb-3 rounded"
    //         value={name}
    //         onChange={(e) => setName(e.target.value)}
    //     />
    //     <input
    //         type="email"
    //         placeholder="Email"
    //         className="border p-2 w-full mb-3 rounded"
    //         value={email}
    //         onChange={(e) => setEmail(e.target.value)}
    //     />
    //     <input
    //         type="password"
    //         placeholder="Password"
    //         className="border p-2 w-full mb-3 rounded"
    //         value={password}
    //         onChange={(e) => setPassword(e.target.value)}
    //     />
    //     <button onClick={handleLogin} className="bg-blue-500 text-white p-2 rounded w-full">
    //         Login
    //     </button>
    //     <button onClick={handleSignUp} className="bg-blue-500 text-white p-2 rounded w-full">
    //         Sign Up
    //     </button>
    //     </form>
    // </div>
    // );
};

export default Login;