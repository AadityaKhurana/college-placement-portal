
//

import Notifications from "@/components/Notifications";

<Notifications />

//

// import { useState } from "react";

// const RecruiterDashboard = () => {
//   const [applicants, setApplicants] = useState([
//     { id: 1, name: "jayant chauhan", job: "Software Engineer", status: "Pending" },
//     { id: 2, name: "virat kohli", job: "Data Analyst", status: "Shortlisted" },
//     { id: 3, name: "messi ", job: "Software Engineer", status: "Rejected" },
//   ]);

//   const [searchQuery, setSearchQuery] = useState("");
//   const [filter, setFilter] = useState("All");

//   const handleAction = (applicantId: number, action: "Shortlisted" | "Rejected") => {
//     setApplicants((prevApplicants) =>
//       prevApplicants.map((applicant) =>
//         applicant.id === applicantId ? { ...applicant, status: action } : applicant
//       )
//     );
//   };

//   const filteredApplicants = applicants.filter((applicant) => {
//     const matchesSearch = applicant.name
//       .toLowerCase()
//       .includes(searchQuery.toLowerCase());
//     const matchesFilter =
//       filter === "All" ||
//       (filter === "Pending" && applicant.status === "Pending") ||
//       (filter === "Shortlisted" && applicant.status === "Shortlisted") ||
//       (filter === "Rejected" && applicant.status === "Rejected");
//     return matchesSearch && matchesFilter;
//   });

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold mb-4">Recruiter Dashboard</h1>

//       <section>
//         <h2 className="text-xl font-semibold mb-2">Applicants</h2>
//         <div className="flex items-center gap-4 mb-4">
//           <input
//             type="text"
//             placeholder="Search applicants..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="p-2 border rounded w-1/3"
//           />
//           <select
//             value={filter}
//             onChange={(e) => setFilter(e.target.value)}
//             className="p-2 border rounded"
//           >
//             <option value="All">All</option>
//             <option value="Pending">Pending</option>
//             <option value="Shortlisted">Shortlisted</option>
//             <option value="Rejected">Rejected</option>
//           </select>
//         </div>
//         <ul>
//           {filteredApplicants.map((applicant) => (
//             <li key={applicant.id} className="mb-4">
//               <div>
//                 <strong>{applicant.name}</strong> applied for{" "}
//                 <strong>{applicant.job}</strong> -{" "}
//                 <span
//                   className={`${
//                     applicant.status === "Shortlisted"
//                       ? "text-green-500"
//                       : applicant.status === "Rejected"
//                       ? "text-red-500"
//                       : "text-gray-500"
//                   }`}
//                 >
//                   {applicant.status}
//                 </span>
//               </div>
//               {applicant.status === "Pending" && (
//                 <div className="mt-2">
//                   <button
//                     className="mr-2 px-4 py-2 bg-green-500 text-white rounded"
//                     onClick={() => handleAction(applicant.id, "Shortlisted")}
//                   >
//                     Shortlist
//                   </button>
//                   <button
//                     className="px-4 py-2 bg-red-500 text-white rounded"
//                     onClick={() => handleAction(applicant.id, "Rejected")}
//                   >
//                     Reject
//                   </button>
//                 </div>
//               )}
//             </li>
//           ))}
//         </ul>
//         {filteredApplicants.length === 0 && (
//           <p className="text-gray-500">No applicants match your criteria.</p>
//         )}
//       </section>
//     </div>
//   );
// };

// export default RecruiterDashboard;


// pages/recruiter/dashboard.tsx
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ref, set, get, child, push } from "firebase/database";
import { logoutUser } from "../firebase/auth";
import { database } from "../firebase/firebaseConfig";
import { useRouter } from "next/router";
import styles from '@/styles/RecruiterDashboard.module.css';

// TypeScript Interfaces
interface JobPosting {
	id: string;
	company: string;
	title: string;
	ctc: number;
	role: string;
	// requiredFields: string[];
	// applicationFields: Record<string, string>;
	// applicants: Applicant[];
	applicants: Record<string, { status: string }>;
	status: 'Open' | 'Closed';
}

interface Applicant {
	id: string;
	name: string;
	// email: string;
	// applicationDetails: Record<string, string>;
	status: 'Accepted'|'Rejected' |`Shortlisted`;
}

const RecruiterDashboard = () => {
	// State Management
	const [jobPostings, setJobPostings] = useState<JobPosting[]>([
	// {
	// 	id: "1",
	// 	title: 'Software Engineer',
	// 	ctc: 10,
	// 	company: 'Google',
	// 	// requiredFields: ['Resume', 'Experience', 'Skills'],
	// 	// applicationFields: {},
	// 	applicants: [],
	// 	status: 'Open'
	// }
	]);
	// const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);

	const [newJobPosting, setNewJobPosting] = useState<Partial<JobPosting>>({});
	const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
	const [uid, setUID] = useState('');
	const [applicants, setApplicants] = useState<Applicant[]>([]);
	const router = useRouter();
	
	useEffect(() => {
		const auth = getAuth();
		onAuthStateChanged(auth, (user) => {
			if (user) {
				const dbRef = ref(database);
				get(child(dbRef, `users/${user.uid}`)).then((snapshot) => { //snapshot = users
					if (snapshot.exists()) {
						get(child(dbRef, `colleges/${snapshot.child('college').val()}/postings`)).then((snapshot1) => {
							if (snapshot1.exists()) { // snapshot1 = colleges
								const postData = snapshot1.val();
								const postList: JobPosting[] = [];
								for (const key in postData) {
									if(postData[key].company == snapshot.child('company').val()) {
										const post: JobPosting = {
											id: key,
											title: postData[key].title,
											ctc: postData[key].ctc,
											company: postData[key].company,
											applicants: postData[key].applicants,
											status: postData[key].status,
											role: postData[key].role
										};
										postList.push(post);
									}
								}
								console.log(postList)
								setJobPostings(postList);
							}
						});
					}
					else {
						console.log("No data available");
					}
				});
			}
		})
	}, []);

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
	// Job Posting Methods
	const handleCreateJobPosting = () => {
		const auth = getAuth();
		onAuthStateChanged(auth, (user) => {
			if (user) {
				setUID(user.uid);
				if (newJobPosting.title && newJobPosting.ctc) {
					const dbRef = ref(database);
					get(child(dbRef, `users/${uid}`)).then((snapshot) => {
						if (snapshot.exists()) {
							const newJob: JobPosting = {
								...newJobPosting,
								company: snapshot.child('company').val(),
								status: 'Open'
							} as JobPosting;
							const collegeID = snapshot.child('college').val()
							if(collegeID){
								const newJobRef = push(child(dbRef, `colleges/${snapshot.child('college').val()}/postings`));
								set(newJobRef, newJob).then(() => {
									console.log("New job posting added to Firebase:", newJob);
								}).catch((error) => {
									console.error("Error adding new job posting to Firebase:", error);
								});
								
								setJobPostings(prev => [...prev, newJob]);
								setNewJobPosting({ title: ''});
							}
						}
						else {
							console.log("No data available");
						}
					});
				}
			}
		})
	
	};


	// Applicant Management
	const updateApplicantStatus = async (jobId: string, applicantId: string, newStatus: Applicant['status']) => {
		try{
			const snapshot = await get(child(ref(database), `users/${applicantId}`));
			if (snapshot.exists()) {
				// Update applicant status in job posting
				const collegeID = snapshot.child('college').val()
				if (collegeID){
					set(ref(database, `colleges/${collegeID}/postings/${jobId}/applicants/${applicantId}/status`), newStatus).then(() => {
						console.log("Applicant status updated in Firebase");
					}).catch((error) => {
						console.error("Error updating applicant status in Firebase:", error);
					});
	
					// Update applicant status in user's postings
					set(ref(database, `users/${applicantId}/postings/${jobId}/status`), newStatus).then(() => {
						console.log("Applicant status updated in Firebase");
					}).catch((error) => {
						console.error("Error updating applicant status in Firebase:", error);
					});
				}
			}
			
			// Update local state
			setJobPostings(prev => 
				prev.map(job => 
					job.id === jobId 
						? {
							...job, 
							applicants: {
								...job.applicants,
								[applicantId]: { status: newStatus }
							}
						}
						: job
				)
			);
			// Update the applicants state for the selected job
			if (selectedJob && selectedJob.id === jobId) {
				setApplicants(prev => 
					prev.map(applicant => 
						applicant.id === applicantId 
							? { ...applicant, status: newStatus }
							: applicant
					)
				);
			}
		} catch (error) {
			console.error("Error updating applicant status:", error);
		}
		
		
	};

	// Result Announcement
	// const announceResults = (jobId: string) => {
	// setJobPostings(prev => 
	// 	prev.map(job => 
	// 	job.id === jobId 
	// 		? {
	// 			...job, 
	// 			status: 'Closed',
	// 			applicants: job.applicants.map(applicant => 
	// 			applicant.status === 'Shortlisted' 
	// 				? {...applicant, status: 'Selected'}
	// 				: applicant
	// 			)
	// 		}
	// 		: job
	// 	)
	// );
	// };

	const convertApplicantsToArray = async (applicants: Record<string, { status: string }>): Promise<Applicant[]> => {
		if (!applicants) {
			return [];
		}
		const snapshot = await get(child(ref(database), `users/`));
		return Object.entries(applicants).map(([id, details]) => ({
			id,
			name: snapshot.child(id).child('name').val(),
			status: details.status as Applicant['status'],
		}));
	};
	useEffect(() => {
		if (selectedJob) {
			convertApplicantsToArray(selectedJob.applicants).then(applicants => {
				setApplicants(applicants);
			}).catch(error => {
				console.error("Error converting applicants to array:", error);
			});
		}
	}, [selectedJob]);

	return (
	<div className={styles.container}>
		{/* Job Posting Section */}
		<section className={styles.jobPostingSection}>
		<h2 className={styles.sectionTitle}>Create Job Posting</h2>
		<button onClick={handleLogout} className={styles.editButton}>
			Logout
		</button>
		<div className={styles.jobPostingForm}>
			<input 
			placeholder="Job Title"
			value={newJobPosting.title || ''}
			onChange={(e) => setNewJobPosting(prev => ({...prev, title: e.target.value}))}
			className={styles.input}
			/>
			<input 
			type="number"
			placeholder="CTC (in LPA)"
			value={newJobPosting.ctc || ''}
			onChange={(e) => setNewJobPosting(prev => ({...prev, ctc: Number(e.target.value)}))}
			className={styles.input}
			/>
			<input 
			placeholder="Job Role"
			value={newJobPosting.role || ''}
			onChange={(e) => setNewJobPosting(prev => ({...prev, role: e.target.value}))}
			className={styles.input}
			/>
			{/* {newJobPosting.requiredFields?.map((field, index) => (
			<input
				key={index}
				placeholder={`Required Field ${index + 1}`}
				value={field}
				onChange={(e) => {
				const newFields = [...(newJobPosting.requiredFields || [])];
				newFields[index] = e.target.value;
				setNewJobPosting(prev => ({...prev, requiredFields: newFields}));
				}}
				className={styles.input}
			/>
			))} */}
			{/* <button onClick={addRequiredField} className={styles.secondaryButton}>
			Add Field
			</button> */}
			<button onClick={handleCreateJobPosting} className={styles.primaryButton}>
			Create Job Posting
			</button>
		</div>
		</section>

		{/* Job Listings Section */}
		<section className={styles.jobListingsSection}>
		<h2 className={styles.sectionTitle}>Job Listings</h2>
		{jobPostings.map(job => (
			<div key={job.id} className={styles.jobCard}>
			<p>Title: {job.title}</p>
			<p>CTC: {job.ctc}</p>
			<p>Role: {job.role}</p>
			<p>Status: {job.status}</p>
			<button 
				onClick={() => setSelectedJob(job)} 
				className={styles.secondaryButton}
			>
				View Applicants
			</button>
			</div>
		))}
		</section>

		{/* Applicant Management Model */}
		{selectedJob && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2>Applicants for {selectedJob.title}</h2>
                        {applicants.length > 0 ? (
                            applicants.map(applicant => (
                                <div key={applicant.id} className={styles.applicantCard}>
                                    <h3>{applicant.name}</h3>
                                    <p>Status: {applicant.status}</p>
                                    <div className={styles.actionButtons}>
                                        <button
                                            onClick={() => updateApplicantStatus(selectedJob.id, applicant.id, 'Rejected')}
                                            className={styles.dangerButton}
                                        >
                                            Reject
                                        </button>
										<button
                                            onClick={() => updateApplicantStatus(selectedJob.id, applicant.id, 'Shortlisted')}
                                            className={styles.primaryButton}
                                        >
                                            Shortlist
                                        </button>
										<button
                                            onClick={() => updateApplicantStatus(selectedJob.id, applicant.id, 'Accepted')}
                                            className={styles.secondaryButton}
                                        >
                                            Accept
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No applicants found.</p>
                        )}
                        <button
                            onClick={() => setSelectedJob(null)}
                            className={styles.secondaryButton}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
		{/* {selectedJob && (
		<div className={styles.modal}>
			<div className={styles.modalContent}>
			<h2>Applicants for {selectedJob.title}</h2>
			{selectedJob.applicants.map(applicant => (
				<div key={applicant.id} className={styles.applicantCard}>
				<h3>{applicant.name}</h3>
				<p>Status: {applicant.status}</p>
				<div className={styles.actionButtons}>
					<button 
					onClick={() => updateApplicantStatus(selectedJob.id, applicant.id, 'Shortlisted')}
					className={styles.primaryButton}
					>
					Shortlist
					</button>
					<button 
					onClick={() => updateApplicantStatus(selectedJob.id, applicant.id, 'Rejected')}
					className={styles.dangerButton}
					>
					Reject
					</button>
				</div>
				</div>
			))}
			<button 
				onClick={() => announceResults(selectedJob.id)}
				className={styles.primaryButton}
			>
				Announce Final Results
			</button>
			<button 
				onClick={() => setSelectedJob(null)}
				className={styles.secondaryButton}
			>
				Close
			</button>
			</div>
		</div>
		)} */}
	</div>
	);
};

export default RecruiterDashboard;