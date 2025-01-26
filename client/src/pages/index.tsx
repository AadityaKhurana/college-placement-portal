import { useState } from "react";
import { getCurrentUser, loginUser, registerUser } from "./firebase/auth";
import { useRouter } from "next/router";
import { getDatabase, ref, set, get, child } from "firebase/database";
import Link from 'next/link';
import styles from '../styles/Home.module.css';

type UserType = 'student' | 'recruiter' | 'admin';
type AuthMode = 'signup' | 'signin';

const db = getDatabase();


const Login = () => {
    // const [showSignup, setShowSignup] = useState(false);
    // const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);
    // const [signupForm, setSignupForm] = useState({
    //     name: '',
    //     email: '',
    //     password: '',
    //     college: '',
    //     phone: '',
    //     skills: [],
    //     userType: '' as UserType
    // });

    const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);
    const [selectedAuthMode, setSelectedAuthMode] = useState<AuthMode>('signup');
    const [authForm, setAuthForm] = useState({
        name: '',
        email: '',
        company: '',
        collegeName: '',
        phone: '',
        password: '',
        userType: '' as UserType
    });
    const router = useRouter();


    // const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const { name, value } = e.target;
    //     setSignupForm(prev => ({
    //       ...prev,
    //       [name]: value,
    //       userType: selectedUserType || prev.userType
    //     }));
    // };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAuthForm(prev => ({
          ...prev,
          [name]: value,
          userType: selectedUserType || prev.userType
        }));
      };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedAuthMode === 'signin') {
            try {
                await loginUser(authForm.email, authForm.password);
                var user = getCurrentUser();
                if (user) {
                    console.log("User logged in");
                    const dbRef = ref(getDatabase());
                    get(child(dbRef, `users/${user.uid}/role`)).then((snapshot) => {
                        if (snapshot.exists()) {
                            if(snapshot.val() == "student") {
                                router.push("/student/dashboard");
                            } else if(snapshot.val() == "recruiter") {
                                router.push("/recruiter/dashboard");
                            } else if(snapshot.val() == "admin") {
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
        }
        else if (selectedAuthMode === 'signup') {
            try {
                await registerUser(authForm.email, authForm.password);
                var user = getCurrentUser();
                if (user) {
                    // console.log("User registered");
                    set(ref(db, 'users/'+user.uid+'/email'), authForm.email);
                    set(ref(db, 'users/'+user.uid+'/name'), authForm.name);
                    set(ref(db, 'users/'+user.uid+'/college'), authForm.collegeName);
                    set(ref(db, 'users/'+user.uid+'/phone'), authForm.phone);
                    set(ref(db, 'users/'+user.uid+'/postings'), {"a": "b"});
                    set(ref(db, 'users/'+user.uid+'/skills'), {0: "No skills added"});
                    if(selectedUserType == "student") {
                        await set(ref(db, 'users/'+user.uid+'/role'), "student");
                        router.push("/student/dashboard");
                    } else if(selectedUserType == "recruiter") {
                        await set(ref(db, 'users/'+user.uid+'/role'), "recruiter");
                        await set(ref(db, 'users/'+user.uid+'/company'), authForm.company);
                        router.push("/recruiter/dashboard");
                    } else if(selectedUserType == "admin") {
                        await set(ref(db, 'users/'+user.uid+'/role'), "admin");
                        router.push("/admin/dashboard");
                    }
                } else {
                    console.log("User is null");
                }
                    
            } catch (err: any) {
                console.log(err.message);
            }
        }
    };

    // const handleLogin = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     try {
    //         await loginUser(signupForm.email, signupForm.password);
    //         // router.push("/student/dashboard"); // Redirect based on role
    //         var user = getCurrentUser();
    //         if (user) {
    //             // console.log("User logged in");
    //             const dbRef = ref(getDatabase());
    //             get(child(dbRef, `users/${user.uid}/role`)).then((snapshot) => {
    //             if (snapshot.exists()) {
    //                 if(snapshot.val() == "student") {
    //                     console.log("Student");
    //                     router.push("/student/dashboard");
    //                 } else if(snapshot.val() == "company") {
    //                     console.log("Company");
    //                     router.push("/recruiter/dashboard");
    //                 } else if(snapshot.val() == "admin") {
    //                     console.log("Admin");
    //                     router.push("/admin/dashboard");
    //                 }
    //         }
    //         else {
    //                 console.log("No data available");
    //             }
    //             }).catch((error) => {
    //                 console.error(error);
    //             });
    //         } else {
    //             console.log("User is null");
    //         }
    //     } catch (err: any) {
    //         console.log(err.message);
    //     }
    // };

    // const handleSignUp = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     try {
    //         await registerUser(signupForm.email, signupForm.password);
    //         var user = getCurrentUser();
    //         if (user) {
    //             // console.log("User registered");
    //             set(ref(db, 'users/'+user.uid+'/email'), signupForm.email);
    //             set(ref(db, 'users/'+user.uid+'/name'), signupForm.name);
    //             set(ref(db, 'users/'+user.uid+'/college'), signupForm.college);
    //             set(ref(db, 'users/'+user.uid+'/phone'), signupForm.phone);
    //             set(ref(db, 'users/'+user.uid+'/postings'), {"a": "b"});
    //             set(ref(db, 'users/'+user.uid+'/skills'), {0: "No skills added"});
    //             if(selectedUserType == "student") {
    //                 await set(ref(db, 'users/'+user.uid+'/role'), "student");
    //                 router.push("/student/dashboard");
    //             } else if(selectedUserType == "recruiter") {
    //                 await set(ref(db, 'users/'+user.uid+'/role'), "recruiter");
    //                 router.push("/recruiter/dashboard");
    //             } else if(selectedUserType == "admin") {
    //                 await set(ref(db, 'users/'+user.uid+'/role'), "admin");
    //                 router.push("/admin/dashboard");
    //             }
    //         } else {
    //             console.log("User is null");
    //         }
                
    //     } catch (err: any) {
    //         console.log(err.message);
    //     }
    // };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f0f2f5',
            position: 'relative'
          }}>
            <div style={{
              width: '100%',
              maxWidth: '400px',
              padding: '20px',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <h1 style={{
                textAlign: 'center',
                color: '#333',
                marginBottom: '20px'
              }}>
                Placement Platform
              </h1>
              
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                {(['student', 'recruiter', 'admin'] as UserType[]).map(userType => (
                  <button 
                    key={userType}
                    style={{
                      margin: '0 10px',
                      padding: '10px 15px',
                      borderRadius: '4px',
                      backgroundColor: selectedUserType === userType ? '#007bff' : '#6c757d',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedUserType(userType)}
                  >
                    {userType.charAt(0).toUpperCase() + userType.slice(1)}
                  </button>
                ))}
              </div>
      
              {selectedUserType && (
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '20px'
                  }}>
                    {(['signup', 'signin'] as AuthMode[]).map(mode => (
                      <button
                        key={mode}
                        style={{
                          margin: '0 10px',
                          padding: '10px 15px',
                          borderRadius: '4px',
                          backgroundColor: selectedAuthMode === mode ? '#007bff' : '#6c757d',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedAuthMode(mode)}
                      >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </button>
                    ))}
                  </div>
      
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {selectedAuthMode === 'signup' && selectedUserType == 'recruiter' && (
                      <>
                        <input
                          type="text"
                          name="name"
                          placeholder="Full Name"
                          value={authForm.name}
                          onChange={handleFormChange}
                          required
                          style={{
                            padding: '10px',
                            borderRadius: '4px',
                            border: '1px solid #ced4da'
                          }}
                        />
                        <input
                          type="text"
                          name="company"
                          placeholder="Company Name"
                          value={authForm.company}
                          onChange={handleFormChange}
                          required
                          style={{
                            padding: '10px',
                            borderRadius: '4px',
                            border: '1px solid #ced4da'
                          }}
                        />
                        <input
                          type="text"
                          name="collegeName"
                          placeholder="College Name"
                          value={authForm.collegeName}
                          onChange={handleFormChange}
                          required
                          style={{
                            padding: '10px',
                            borderRadius: '4px',
                            border: '1px solid #ced4da'
                          }}
                        />
                        <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={authForm.phone}
                        onChange={handleFormChange}
                        required
                        style={{
                            padding: '10px',
                            borderRadius: '4px',
                            border: '1px solid #ced4da'
                        }}
                        />
                      </>
                    )}
                    {selectedAuthMode === 'signup' && selectedUserType != 'recruiter' && (
                      <>
                        <input
                          type="text"
                          name="name"
                          placeholder="Full Name"
                          value={authForm.name}
                          onChange={handleFormChange}
                          required
                          style={{
                            padding: '10px',
                            borderRadius: '4px',
                            border: '1px solid #ced4da'
                          }}
                        />
                        <input
                          type="text"
                          name="collegeName"
                          placeholder="College Name"
                          value={authForm.collegeName}
                          onChange={handleFormChange}
                          required
                          style={{
                            padding: '10px',
                            borderRadius: '4px',
                            border: '1px solid #ced4da'
                          }}
                        />
                        <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={authForm.phone}
                        onChange={handleFormChange}
                        required
                        style={{
                            padding: '10px',
                            borderRadius: '4px',
                            border: '1px solid #ced4da'
                        }}
                        />
                      </>
                    )}
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={authForm.email}
                      onChange={handleFormChange}
                      required
                      style={{
                        padding: '10px',
                        borderRadius: '4px',
                        border: '1px solid #ced4da'
                      }}
                    />
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={authForm.password}
                      onChange={handleFormChange}
                      required
                      style={{
                        padding: '10px',
                        borderRadius: '4px',
                        border: '1px solid #ced4da'
                      }}
                    />
                    
                    <button 
                      type="submit" 
                      style={{
                        padding: '10px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {selectedAuthMode.charAt(0).toUpperCase() + selectedAuthMode.slice(1)} 
                      {' '}as {selectedUserType.charAt(0).toUpperCase() + selectedUserType.slice(1)}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
		// <div className={styles.container}>
		// 	<div className={styles.background}></div>
		// 	<div className={styles.content}>
		// 		<h1 className={styles.title}>Placement Platform</h1>
				
		// 		<div className={styles.buttonGroup}>
		// 			<button 
		// 				className={styles.mainButton}
		// 				onClick={() => {
		// 					setShowSignup(true);
		// 					setSelectedUserType(null);
		// 				}}
		// 			>
		// 				Sign Up
		// 			</button>
					
		// 			<div className={styles.signinOptions}>
		// 				<Link href="/student/signin" className={styles.link}>
		// 					<button className={styles.signinButton}>
		// 						Student Sign In
		// 					</button>
		// 				</Link>
		// 				<Link href="/recruiter/signin" className={styles.link}>
		// 					<button className={styles.signinButton}>
		// 						Recruiter Sign In
		// 					</button>
		// 				</Link>
		// 				<Link href="/admin/signin" className={styles.link}>
		// 					<button className={styles.signinButton}>
		// 						Admin Sign In
		// 					</button>
		// 				</Link>
		// 			</div>
		// 		</div>

		// 		{showSignup && (
		// 			<div className={styles.modal}>
		// 				<div className={styles.modalContent}>
		// 					<h2>Select User Type</h2>
		// 					<div className={styles.userTypeSelect}>
		// 						<button 
		// 							className={`${styles.userTypeButton} ${selectedUserType === 'student' ? styles.selected : ''}`}
		// 							onClick={() => setSelectedUserType('student')}
		// 						>
		// 							Student
		// 						</button>
		// 						<button 
		// 							className={`${styles.userTypeButton} ${selectedUserType === 'recruiter' ? styles.selected : ''}`}
		// 							onClick={() => setSelectedUserType('recruiter')}
		// 						>
		// 							Recruiter
		// 						</button>
		// 						<button 
		// 							className={`${styles.userTypeButton} ${selectedUserType === 'admin' ? styles.selected : ''}`}
		// 							onClick={() => setSelectedUserType('admin')}
		// 						>
		// 							Admin
		// 						</button>
		// 					</div>

		// 					{selectedUserType && (
		// 						<form onSubmit={handleSignUp} className={styles.signupForm}>
		// 							<input
		// 								type="text"
		// 								name="name"
		// 								placeholder="Full Name"
		// 								value={signupForm.name}
		// 								onChange={handleSignupChange}
		// 								required
		// 							/>
		// 							<input
		// 								type="email"
		// 								name="email"
		// 								placeholder="Email Address"
		// 								value={signupForm.email}
		// 								onChange={handleSignupChange}
		// 								required
		// 							/>
        //                             <input
        //                                 type="tel"
		// 								name="phone"
		// 								placeholder="Phone number"
		// 								value={signupForm.phone}
		// 								onChange={handleSignupChange}
		// 								required
		// 							/>
        //                             <input
		// 								type="text"
		// 								name="college"
		// 								placeholder="College name"
		// 								value={signupForm.college}
		// 								onChange={handleSignupChange}
		// 								required
		// 							/>
		// 							<input
		// 								type="password"
		// 								name="password"
		// 								placeholder="Password"
		// 								value={signupForm.password}
		// 								onChange={handleSignupChange}
		// 								required
		// 							/>
		// 							<button type="submit" className={styles.submitButton}>
		// 								Sign Up as {selectedUserType.charAt(0).toUpperCase() + selectedUserType.slice(1)}
		// 							</button>
		// 						</form>
		// 					)}
							
		// 					<button 
		// 						className={styles.closeButton}
		// 						onClick={() => {
		// 							setShowSignup(false);
		// 							setSelectedUserType(null);
		// 						}}
		// 					>
		// 						Close
		// 					</button>
		// 				</div>
		// 			</div>
		// 		)}
		// 	</div>
		// </div>
	);
};

export default Login;