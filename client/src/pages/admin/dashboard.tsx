import { useState, useRef, useEffect } from 'react';
import styles from '@/styles/AdminDashboard.module.css';
import { database } from '../firebase/firebaseConfig';
import { get, set, ref, remove} from 'firebase/database';
import { logoutUser } from '../firebase/auth';
import { useRouter } from 'next/router';

interface College {
	id: number;
	name: string;
	students: number;//TODO: remove
	recruiters: number;//TODO: remove
	logo?: string;
	brandingColors?: {
		primary: string;
		secondary: string;
	};
	placementPolicies?: string[];
	requirementSpecifications?: {
		eligibilityCriteria?: string[];
		documentTemplates?: string[];
	};
}

interface Student {
	id: string;
	name: string;
	collegeId: number;
	placementStatus: 'Placed' | 'Not Placed';
	company?: string;
}

interface Recruiter {
	id: string;
	name: string;
	company: string;
	collegeId: number;
}

const AdminDashboard = () => {
	// const [colleges, setColleges] = useState<College[]>([
	// 	{ 
	// 		id: 1, 
	// 		name: "Netaji Subhash Tech University", 
	// 		students: 200, 
	// 		recruiters: 15,
	// 		placementPolicies: ['Minimum CGPA 7.5', 'No Active Backlogs'],
	// 		requirementSpecifications: {
	// 			eligibilityCriteria: ['B.Tech in Computer Science', 'CGPA > 7.5'],
	// 			documentTemplates: ['Resume Template', 'NOC Template']
	// 		}
	// 	}
	// ]);
	const [colleges, setColleges] = useState<College[]>([]);

	const [students, setStudents] = useState<Student[]>([
		{ id: "1", name: "Jayant Chauhan", collegeId: 1, placementStatus: 'Placed', company: 'Tech Solutions' }
	]);

	const [recruiters, setRecruiters] = useState<Recruiter[]>([
		{ id: "1", name: "John Doe", company: "Tech Solutions", collegeId: 1 }
	]);

	const [collegeName, setCollegeName] = useState("");
	const [activeSection, setActiveSection] = useState<'colleges' | 'students' | 'recruiters' | 'requirements'>('colleges');
	const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
	const logoInputRef = useRef<HTMLInputElement>(null);
	const router = useRouter();

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
		// Fetch colleges from database
		get(ref(database, 'colleges')).then((snapshot) => {
			if (snapshot.exists()) {
				const data = snapshot.val();
				const colleges = Object.values(data).map((college: any) => ({
					id: 1,
					name: college.name,
					students: 0,
					recruiters: 0,
					placementPolicies: [],
					requirementSpecifications: {}
				}));
				setColleges(colleges);
			}
		});

		//Fetch students from database
		get(ref(database, 'users')).then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const students = Object.entries(data)
                    .filter(([key, value]: [string, any]) => value.role === 'student')
                    .map(([key, value]: [string, any]) => ({
                        id: key,
                        name: value.name,
						collegeId: value.college,
                        placementStatus: value.placementStatus || 'Not Placed',
                        company: value.company || ''
                    }));
                setStudents(students);
            }
        });

		//Fetch recruiters from database
		get(ref(database, 'users')).then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const recruiters = Object.entries(data)
                    .filter(([key, value]: [string, any]) => value.role === 'recruiter')
                    .map(([key, value]: [string, any]) => ({
                        id: key,
                        name: value.name,
						collegeId: value.college,
                        company: value.company || ''
                    }));
                setRecruiters(recruiters);
            }
        });
	}, []);

	const handleAddCollege = async () => {
		if (collegeName.trim()) {
			const newCollege: College = {
				id: Date.now(),
				name: collegeName,
				students: 0,
				recruiters: 0,
				placementPolicies: [],
				requirementSpecifications: {}
			};
			await set(ref(database, `colleges/${newCollege.name}`), {"name": newCollege.name});
			setColleges(prev => [...prev, newCollege]);
			setCollegeName("");
		}
	};

	const handleCollegeLogoUpload = (collegeId: number) => {
		const input = logoInputRef.current;
		if (input && input.files && input.files[0]) {
			const file = input.files[0];
			const reader = new FileReader();
			reader.onloadend = () => {
				setColleges(prev => 
					prev.map(college => 
						college.id === collegeId 
							? {...college, logo: reader.result as string} 
							: college
					)
				);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleUpdateCollegeBranding = (collegeId: number, colors: College['brandingColors']) => {
		setColleges(prev => 
			prev.map(college => 
				college.id === collegeId 
					? {...college, brandingColors: colors} 
					: college
			)
		);
	};
	
	const handleRemoveCollege = async (collegeName: string) => {
		try {
			// Remove college from Firebase Realtime Database
			await remove(ref(database, `colleges/${collegeName}`));
			console.log(`College with ID ${collegeName} removed from Firebase`);
	
			// Update local state
			setColleges((prevColleges) => prevColleges.filter((college) => college.name !== collegeName));
		} catch (error) {
			console.error("Error removing college from Firebase:", error);
		}
	};

	const renderDashboardSection = () => {
		switch (activeSection) {
			case 'colleges':
				return (
					<div className={styles.collegeSection}>
						<h2>Colleges Management</h2>
						{colleges.map(college => (
							<div key={college.id} className={styles.collegeCard}>
								<div>
									<strong>{college.name}</strong>
									{/* <p>{college.students} Students, {college.recruiters} Recruiters</p> */}
								</div>
								<div>
									<button onClick={() => setSelectedCollege(college)}>
										Customize
									</button>
									<button onClick={() => handleRemoveCollege(college.name)}>
										Remove
									</button>
								</div>
							</div>
						))}
						<div className={styles.addCollegeForm}>
							<input
								type="text"
								placeholder="College Name"
								value={collegeName}
								onChange={(e) => setCollegeName(e.target.value)}
							/>
							<button onClick={handleAddCollege}>Add College</button>
						</div>
					</div>
				);
			case 'students':
				return (
					<div className={styles.studentsSection}>
						<h2>Students Management</h2>
						{students.map(student => (
							<div key={student.id} className={styles.studentCard}>
								<p>{student.name}</p>
								<p>Status: {student.placementStatus}</p>
								{student.company && <p>Company: {student.company}</p>}
							</div>
						))}
					</div>
				);
			case 'recruiters':
				return (
					<div className={styles.recruitersSection}>
						<h2>Recruiters Management</h2>
						{recruiters.map(recruiter => (
							<div key={recruiter.id} className={styles.recruiterCard}>
								<p>{recruiter.name}</p>
								<p>Company: {recruiter.company}</p>
							</div>
						))}
					</div>
				);
		}
	};

	return (
		<div className={styles.container}>
			<h1 className={styles.pageTitle}>Admin Dashboard</h1>
			
			<div className={styles.navigationTabs}>
				<button onClick={() => setActiveSection('colleges')}>Colleges</button>
				<button onClick={() => setActiveSection('students')}>Students</button>
				<button onClick={() => setActiveSection('recruiters')}>Recruiters</button>
				<button onClick={handleLogout} className={styles.editButton}>
					Logout
				</button>
			</div>

			{renderDashboardSection()}

			{selectedCollege && (
				<div className={styles.collegeCustomizationModal}>
					<div className={styles.modalContent}>
						<h2>Customize {selectedCollege.name}</h2>
						<div>
							<input 
								type="file" 
								ref={logoInputRef}
								onChange={() => handleCollegeLogoUpload(selectedCollege.id)}
							/>
							{selectedCollege.logo && (
								<img src={selectedCollege.logo} alt="College Logo" />
							)}
						</div>
						<div>
							<h3>Branding Colors</h3>
							<input 
								type="color" 
								value={selectedCollege.brandingColors?.primary || '#000000'}
								onChange={(e) => handleUpdateCollegeBranding(selectedCollege.id, {
									primary: e.target.value,
									secondary: selectedCollege.brandingColors?.secondary || '#FFFFFF'
								})}
							/>
							<input 
								type="color" 
								value={selectedCollege.brandingColors?.secondary || '#FFFFFF'}
								onChange={(e) => handleUpdateCollegeBranding(selectedCollege.id, {
									primary: selectedCollege.brandingColors?.primary || '#000000',
									secondary: e.target.value
								})}
							/>
						</div>
						<button onClick={() => setSelectedCollege(null)}>Close</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminDashboard;