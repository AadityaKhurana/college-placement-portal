import { useState } from "react";
import { getCurrentUser, loginUser, registerUser } from "../firebase/auth";
import { useRouter } from "next/router";
import { getDatabase, ref, set, get, child } from "firebase/database";

const db = getDatabase();


const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [name, setName] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await loginUser(email, password);
            // router.push("/student/dashboard"); // Redirect based on role
            var user = getCurrentUser();
            if (user) {
                console.log("User logged in");
                const dbRef = ref(getDatabase());
                get(child(dbRef, `users/${user.uid}`)).then((snapshot) => {
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
                } else {
                    console.log("No data available");
                }
                }).catch((error) => {
                    console.error(error);
                });
            } else {
                setError("User is null");
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await registerUser(email, password);
            var user = getCurrentUser();
            if (user) {
                console.log("User registered");
                set(ref(db, 'users/'+user.uid), "student");
            } else {
                setError("User is null");
            }
                
        } catch (err: any) {
            setError(err.message);
        }
    };

    
    return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
        <form className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h1 className="text-xl font-semibold mb-4">Login</h1>
        {error && <p className="text-red-500 mb-3">{error}</p>}
        <input
            type="text"
            placeholder="Name (Not required if logging in)"
            className="border p-2 w-full mb-3 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
        />
        <input
            type="email"
            placeholder="Email"
            className="border p-2 w-full mb-3 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
        />
        <input
            type="password"
            placeholder="Password"
            className="border p-2 w-full mb-3 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin} className="bg-blue-500 text-white p-2 rounded w-full">
            Login
        </button>
        <button onClick={handleSignUp} className="bg-blue-500 text-white p-2 rounded w-full">
            Sign Up
        </button>
        </form>
    </div>
    );
};

export default Login;


// import Link from "next/link";

// export default function Home() {
//   return (
//     <div className="p-4">
//       <h1 className="text-3xl font-bold mb-4">Welcome to the Placement Platform</h1>
//       <ul>
//         <li>
//           <Link href="/admin/dashboard" className="text-blue-500">
//             Admin Dashboard
//           </Link>
//         </li>
//         <li>
//           <Link href="/student/dashboard" className="text-blue-500">
//             Student Dashboard
//           </Link>
//         </li>
//         <li>
//           <Link href="/recruiter/dashboard" className="text-blue-500">
//             Recruiter Dashboard
//           </Link>
//         </li>
//       </ul>
//     </div>
//   );
// }