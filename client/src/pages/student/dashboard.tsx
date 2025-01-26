// import { useEffect, useState } from "react";
// import { auth } from "../../firebase/firebaseConfig";
// import { onAuthStateChanged } from "firebase/auth";
// import { useRouter } from "next/router";
// import { logoutUser } from "../../firebase/auth";

// const StudentDashboard = () => {
//   	const [user, setUser] = useState<any>(null);
// 	const router = useRouter();

// 	useEffect(() => {
// 		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
// 			setUser(currentUser);
// 		});
// 		return () => unsubscribe();
//   	}, []);

	
// 	const handleLogout = async (e: React.FormEvent) => {
// 		e.preventDefault();
// 		try {
// 			await logoutUser();
// 			router.push("/");
// 		} catch (err: any) {
// 			console.error(err.message);	
// 		};
// 	};
//   	return (
// 		<div className="p-4">
// 			<h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>
// 			{user ? <p>Welcome, {user.email}</p> : <p>Please log in to view your dashboard.</p>}
// 			<button onClick={handleLogout} className="bg-blue-500 text-white p-2 rounded w-full">Logout</button>
// 		</div>
//   	);
// };

// export default StudentDashboard;


// import { useEffect, useState } from "react";
// import { auth } from "@/firebase/firebaseConfig";
// import { onAuthStateChanged } from "firebase/auth";

// const StudentDashboard = () => {
//   const [user, setUser] = useState<any>(null);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//     });
//     return () => unsubscribe();
//   }, []);

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>
//       {user ? <p>Welcome, {user.email}</p> : <p>Please log in to view your dashboard.</p>}
//     </div>
//   );
// };

// export default StudentDashboard;
// import { useState } from "react";

// const StudentDashboard = () => {
//   const [profile, setProfile] = useState({
//     name: "Alice Johnson",
//     email: "alice@example.com",
//     resume: "Resume.pdf",
//   });

//   const [jobs, setJobs] = useState([
//     { id: 1, title: "Software Engineer", company: "ABC Corp", status: "Applied" },
//     { id: 2, title: "Data Analyst", company: "XYZ Ltd", status: "Not Applied" },
//   ]);

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>

//       <section className="mb-6">
//         <h2 className="text-xl font-semibold mb-2">Profile</h2>
//         <p>Name: {profile.name}</p>
//         <p>Email: {profile.email}</p>
//         <p>Resume: <a href="#">{profile.resume}</a></p>
//       </section>

//       <section>
//         <h2 className="text-xl font-semibold mb-2">Job Listings</h2>
//         <ul>
//           {jobs.map((job) => (
//             <li key={job.id} className="mb-2">
//               {job.title} at {job.company} - 
//               <span className={`ml-2 ${job.status === "Applied" ? "text-green-500" : "text-gray-500"}`}>
//                 {job.status}
//               </span>
//             </li>
//           ))}
//         </ul>
//       </section>
//     </div>
//   );
// };

// export default StudentDashboard;

//
import Notifications from "@/components/Notifications";
import { ref, set, get, child } from "firebase/database";
import { database } from "../firebase/firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { logoutUser } from "../firebase/auth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
<Notifications />
import styles from '@/styles/StudentDashboard.module.css';


const StudentDashboard = () => {
	// const [profile, setProfile] = useState({
	// 	name: "Loading...",
	// 	email: "Loading...",
	// 	resume: "Loading...",
	// });


	// Types for better type safety
	interface Profile {
		name: string;
		email: string;
		phone: string;
		skills: string[];
		resume: File | null;
	}

	interface Job {
		id: string;
		title: string;
		company: string;
		status: 'Not Applied' | 'Rejected' | 'Accepted' | 'Interview' | 'Applied';
		interviewPrep?: InterviewPrepResource[];
	}

	interface InterviewPrepResource {
		id: number;
		company: string;
		topic: string;
		description: string;
		link?: string;
	}

	const [profile, setProfile] = useState<Profile>({
		name: '',
		email: '',
		phone: '',
		skills: [],
		resume: null
	});
	const [jobs, setJobs] = useState<Job[]>([]);
	const [uid, setUid] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [filter, setFilter] = useState("All");
	const [isEditingProfile, setIsEditingProfile] = useState(false);
	const router = useRouter();
	const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

	// Profile Management
	const handleProfileEdit = () => {
		setIsEditingProfile(!isEditingProfile);
	};
	
	const handleProfileSave = () => {
		// setProfile(prev => ({...prev, ...updatedProfile}));
		set(ref(database, `users/${uid}/name`), profile.name);
		set(ref(database, `users/${uid}/phone`), profile.phone);
		set(ref(database, `users/${uid}/skills`), profile.skills);
		setIsEditingProfile(false);
	};
	
	const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
		  setProfile(prev => ({...prev, resume: file}));
		}
	};

	//Job application method
	const handleApply = (jobId: string) => {
		setJobs((prevJobs) => prevJobs.map((job) => job.id === jobId ? { ...job, status: "Applied" } : job));
		const dbRef = ref(database);
		get(child(dbRef, `users/${uid}`)).then((snapshot) => {
			if (snapshot.exists()) {
				set(ref(database, `colleges/${snapshot.child("college").val()}/postings/${jobId}/applicants/${uid}`), { status: "Applied" });
				set(ref(database, `users/${uid}/postings/${jobId}`), { status: "Applied" });
			}}).catch((error) => {
				console.error(error);
			});
	};

	//Filter jobs based on search query and filter
	const filteredJobs = jobs.filter((job) => {
		const matchesSearch = job.company.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesFilter =
			filter === "All" ||
			(filter === "Not Applied" && job.status === "Not Applied") ||
			(filter === "Accepted" && job.status === "Accepted") ||
			(filter === "Interview" && job.status === "Interview")||
			(filter === "Rejected" && job.status === "Rejected")||
			(filter === "Applied" && job.status === "Applied");
		return matchesSearch && matchesFilter;
	});

	// Progress Calculation
	const calculateProgress = () => {
		const totalJobs = jobs.length;
		const appliedJobs = jobs.filter(job => job.status === 'Applied').length;
		const interviewJobs = jobs.filter(job => job.status === 'Interview').length;
		
		return {
			totalApplications: totalJobs,
			appliedApplications: appliedJobs,
			interviewApplications: interviewJobs
		};
	};

	//Logout method
	const handleLogout = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await logoutUser();
			router.push("/");
		} catch (err: any) {
			console.error(err.message);	
		};
	};


	useEffect(() => {
		const dbRef = ref(database);
		const auth = getAuth();
		onAuthStateChanged(auth, (user) => {
		if (user) {
			const uid = user.uid;
			setUid(uid);
			//Get role from database
			get(child(dbRef, `users/${uid}`))
				.then((snapshot) => {
					if (snapshot.exists()) {
						// console.log(snapshot.child("role").val());
						setProfile(snapshot.val());
						//Get applied jobs from database
						get(child(dbRef, `users/${uid}/postings`)).then((snapshot1) => {
							if (snapshot1.exists()) {
								const snapshot1Keys = new Set(Object.keys(snapshot1.val()));
								const snapshot1Data = snapshot1.val();
        						// console.log("Snapshot1 Keys: ", snapshot1Keys);
								//Get all jobs from database
								get(child(dbRef, `colleges/${snapshot.child("college").val()}/postings`)).then((snapshot2) => {
									if (snapshot2.exists()) {
										const snapshot2Entries = Object.entries(snapshot2.val());
										const updatedJobs = snapshot2Entries.map(([key, value]) => {
											if (typeof value === 'object' && value !== null && 'title' in value && 'ctc' in value && 'company' in value) {
												if (snapshot1Keys.has(key)) {
													return { id: key, title: String(value.title), company: String(value.company), status: snapshot1Data[key].status };
												} else {
													return { id: key, title: String(value.title), company: String(value.company), status: "Not Applied" };
												}
											} else {
												console.error(`Invalid value for key ${key}:`, value);
												return { id: key, title: "Unknown", company: "Unknown", status: "Not Applied" };
											}
										});
										updatedJobs.sort((a, b) => {
											const companyA = typeof a.company === 'string' ? a.company : '';
											const companyB = typeof b.company === 'string' ? b.company : '';
											return companyA.localeCompare(companyB);
										});
										setJobs(updatedJobs);
									} else {
										console.log("No data available");
									}

								}).catch((error) => {
									console.error(error);
								});
							} else {
							console.log("No data available");
							}
						}).catch((error) => {
							console.error(error);
						});
					} else {
						console.log("No data available");
					}
			}).catch((error) => {
				console.error(error);
			});
			
		} else {
			console.log("No user logged in");
			router.push("/");
		}
		});
	}, []);

	return (
		<div className={styles.container}>
			{/* Profile Section */}
			<section className={styles.profileSection}>
				<h2 className={styles.sectionTitle}>
				Profile 
				<button onClick={handleProfileEdit} className={styles.editButton}>
					{isEditingProfile ? 'Cancel' : 'Edit'}
				</button>
				<button onClick={handleLogout} className={styles.editButton}>
					Logout
				</button>
				</h2>
				
				{isEditingProfile ? (
					<div>
						<input 
						placeholder="Name" 
						value={profile.name}
						onChange={(e) => setProfile({name: e.target.value, email: profile.email, phone: profile.phone, skills: profile.skills, resume: profile.resume})}
						/>

						<input 
						placeholder="Phone Number" 
						value={profile.phone}
						onChange={(e) => setProfile({name: profile.name, email: profile.email, phone: e.target.value, skills: profile.skills, resume: profile.resume})}
						/>

						
						
						<input 
						placeholder="Edit skills (comma separated)" 
						value={profile.skills.map(capitalize).join(', ')}
						onChange={(e) => setProfile({ 
                            ...profile, 
                            skills: e.target.value.split(',').map(skill => skill.trim()).map(capitalize) 
                        })}
						/>

						<button onClick={handleProfileSave} className={styles.editButton}>
							Apply Changes
						</button>
						{/* Add similar inputs for other profile fields */}
						{/* <input 
						type="file" 
						accept=".pdf,.doc,.docx"
						onChange={handleResumeUpload}
						/> */}
					</div>
				) : (
					<div>
						<p>Name: {profile.name}</p>
						<p>Email: {profile.email}</p>
						<p>Skills: {profile.skills.map(capitalize).join(', ')}</p>
						<p>Resume: {profile.resume ? profile.resume.name : 'Not uploaded'}</p>
					</div>
				)}
			</section>
	
			{/* Dashboard Progress */}
			<section className={styles.dashboardProgress}>
				<h2 className={styles.sectionTitle}>Dashboard Progress</h2>
				<div>
					<p>Total Jobs: {calculateProgress().totalApplications}</p>
					<p>Applied: {calculateProgress().appliedApplications}</p>
					<p>Interview Calls: {calculateProgress().interviewApplications}</p>
				</div>
			</section>
	
			{/* Job Listings */}
			<section className={styles.jobListingSection}>
				<h2 className={styles.sectionTitle}>Job Listings</h2>
				<div className={styles.searchContainer}>
					<input
						type="text"
						placeholder="Search jobs..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className={styles.searchInput}
					/>
					<select
						value={filter}
						onChange={(e) => setFilter(e.target.value)}
						className={styles.filterSelect}
					>
						<option value="All">All</option>
						<option value="Not Applied">Not Applied</option>
						<option value="Applied">Applied</option>
						<option value="Interview">Interview</option>
						<option value="Accepted">Accepted</option>
						<option value="Rejected">Rejected</option>
					</select>
				</div>
	
				<ul className={styles.jobList}>
					{filteredJobs.map((job) => (
						<li key={job.id} className={styles.jobItem}>
							<div>
								<strong>{job.title}</strong> at {job.company}
								<span className={styles.jobStatus}>{job.status}</span>
							</div>
							{job.status === 'Not Applied' && (
								<button 
								className={styles.applyButton}
								onClick={() => handleApply(job.id)}
								>
								Apply
								</button>
							)}
							{job.interviewPrep && (
								<div className={styles.interviewPrepSection}>
								<h3>Interview Preparation</h3>
								{job.interviewPrep.map(prep => (
									<div key={prep.id}>
									<p>{prep.topic}</p>
									<a href={prep.link}>Preparation Resources</a>
									</div>
								))}
								</div>
							)}
						</li>
					))}
				</ul>
			</section>
		</div>
	);

	// return (
	// 	<div className="p-4">
	// 		<h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>

	// 		<section className="mb-6">
	// 			<h2 className="text-xl font-semibold mb-2">Profile</h2>
	// 			<p>Name: {profile.name}</p>
	// 			<p>Email: {profile.email}</p>
	// 			<p>
	// 				Resume: <a href="#">{profile.resume}</a>
	// 			</p>
	// 		</section>
	// 		<button onClick={handleLogout} className="bg-blue-500 text-white p-2 rounded w-full">Logout</button>

	// 		<section>
	// 			<h2 className="text-xl font-semibold mb-2">Job Listings</h2>
	// 			<div className="flex items-center gap-4 mb-4">
	// 				<input
	// 					type="text"
	// 					placeholder="Search jobs..."
	// 					value={searchQuery}
	// 					onChange={(e) => setSearchQuery(e.target.value)}
	// 					className="p-2 border rounded w-1/3"
	// 				/>
	// 				<select
	// 					value={filter}
	// 					onChange={(e) => setFilter(e.target.value)}
	// 					className="p-2 border rounded"
	// 				>
	// 					<option value="All">All</option>
	// 					<option value="Pending">Pending</option>
	// 					<option value="Accepted">Accepted</option>
	// 					<option value="Not Applied">Not Applied</option>
	// 				</select>
	// 			</div>
	// 			<ul>
	// 				{filteredJobs.map((job) => (
	// 					<li key={job.id} className="mb-4">
	// 						<div>
	// 							<strong>{job.title}</strong> at {job.company} -{" "}
	// 							<span
	// 								className={`${
	// 									job.status === "Applied" ? "text-green-500" : "text-gray-500"
	// 								}`}
	// 							>
	// 								{job.status}
	// 							</span>
	// 						</div>
	// 						{job.status === "Not Applied" && (
	// 							<button
	// 								className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
	// 								onClick={() => handleApply(job.id)}
	// 							>
	// 								Apply
	// 							</button>
	// 						)}
	// 					</li>
	// 				))}
	// 			</ul>
	// 			{filteredJobs.length === 0 && (
	// 				<p className="text-gray-500">No jobs match your criteria.</p>
	// 			)}
	// 		</section>
	// 	</div>
	// );
};

export default StudentDashboard;