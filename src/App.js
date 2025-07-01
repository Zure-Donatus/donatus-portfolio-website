import React, { useState, useEffect, useMemo, useRef } from 'react';

// --- Firebase Imports ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, getDoc, setDoc, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// --- Helper Functions & Configuration ---

const firebaseConfig = {
  apiKey: "AIzaSyC84ypEJm8Y102eoGom6ZS5ZIJwl6WCEFc",
  authDomain: "donatus-portfolio.firebaseapp.com",
  projectId: "donatus-portfolio",
  storageBucket: "donatus-portfolio.appspot.com",
  messagingSenderId: "665010203194",
  appId: "1:665010203194:web:c6c9cdd6788f4c78186303",
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// --- Icon Components ---
const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d={path} />
    </svg>
);

const Icons = {
    menu: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5",
    close: "M6 18L18 6M6 6l12 12",
    sun: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 5a7 7 0 100 14 7 7 0 000-14z",
    moon: "M12 21a9.75 9.75 0 110-19.5 9.75 9.75 0 010 19.5z",
    code: "M10.25 18.5a.75.75 0 000-1.5H7.75a.75.75 0 000 1.5h2.5zM16.25 18.5a.75.75 0 000-1.5h-2.5a.75.75 0 000 1.5h2.5zM19 6.5a3.5 3.5 0 00-3.5-3.5H8.5A3.5 3.5 0 005 6.5v11A3.5 3.5 0 008.5 21h7a3.5 3.5 0 003.5-3.5v-11zM8.5 5h7a1.5 1.5 0 011.5 1.5v11a1.5 1.5 0 01-1.5 1.5h-7a1.5 1.5 0 01-1.5-1.5v-11A1.5 1.5 0 018.5 5z",
    design: "M12 2.25a.75.75 0 01.75.75v11.265l3.22-3.22a.75.75 0 011.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zM3 18.75a.75.75 0 000 1.5h18a.75.75 0 000-1.5H3z",
    consultancy: "M18 18.75h-5.25v-6.75h5.25V18.75zM11.25 12H6v6.75h5.25V12zM18 3.75h-5.25V10.5h5.25V3.75zM11.25 3.75H6v5.25h5.25V3.75z",
    download: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3",
    email: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75",
    whatsapp: "M19.722 8.384a8.216 8.216 0 00-11.623 11.624L4.5 21l1.002-3.608a8.216 8.216 0 0011.624-11.623zM12.001 2.3a9.716 9.716 0 017.34 3.793 9.716 9.716 0 01-3.792 15.05l-1.372.41-1.03 3.714-3.715-1.03-.41-1.37A9.716 9.716 0 012.3 12a9.664 9.664 0 013.792-7.34A9.664 9.664 0 0112.002 2.3zm0 4.39a.75.75 0 00-.75.75v3.61a.75.75 0 00.75.75h2.54a.75.75 0 000-1.5h-1.79V7.44a.75.75 0 00-.75-.75z",
    phone: "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3",
    upload: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5",
    trash: "M16.5 4.5h-9m9 0a1.5 1.5 0 01-1.5 1.5h-6A1.5 1.5 0 014.5 4.5m9 0V3a1.5 1.5 0 00-1.5-1.5h-6A1.5 1.5 0 004.5 3v1.5m12 0h-15m15 0v13.5A2.25 2.25 0 0117.25 21h-10.5A2.25 2.25 0 014.5 18.75V4.5",
    edit: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10",
    chatbot: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM21 12c0 5.385-4.059 9.75-9 9.75s-9-4.365-9-9.75 4.059-9.75 9-9.75 9 4.365 9 9.75z",
    send: "M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z",
    github: "M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12 4.125a7.875 7.875 0 110 15.75 7.875 7.875 0 010-16.5zm-3.187 8.313a.75.75 0 00-1.063.22l-1.5 2.25a.75.75 0 101.28.858l1.5-2.25a.75.75 0 00-.217-1.088zm6.374 0a.75.75 0 00-.217 1.088l1.5 2.25a.75.75 0 101.28-.858l-1.5-2.25a.75.75 0 00-1.063-.22z",
    linkedin: "M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zm-11 6H5v9h3V9zm-1.5-2.25a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17 9h-2.1c-1.6 0-2.9 1.3-2.9 2.9V18h3v-5.1c0-.6.5-1.1 1.1-1.1h.9V9z",
    facebook: "M12 2.04c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm2.5 10.5h-2v5h-3v-5h-2v-2.5h2v-2c0-1.7 1.1-2.5 2.8-2.5h1.7v2.5h-1.1c-.6 0-.7.3-.7.7v1.6h1.8l-.2 2.5z",
    tiktok: "M12 2.04c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm4.2 5.96h-2.7v6.5c0 1.4-.9 2.5-2.5 2.5s-2.5-1.1-2.5-2.5V9.5h-2.7V7h2.7v-.5c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5V7h2.7v2.5z"
};

// --- Custom Hooks for Data Fetching ---

const useFirestoreCollection = (collectionName) => {
    const [data, setData] = useState([]);
    useEffect(() => {
        const q = collection(db, collectionName);
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const items = [];
            querySnapshot.forEach((doc) => {
                const docData = doc.data();
                const timestamp = docData.createdAt?.toDate ? docData.createdAt.toDate() : new Date();
                items.push({ id: doc.id, ...docData, timestamp });
            });
            items.sort((a, b) => b.timestamp - a.timestamp);
            setData(items);
        });
        return () => unsubscribe();
    }, [collectionName]);
    return data;
};

const useFirestoreDocument = (collectionName, docId) => {
    const [data, setData] = useState(null);
    useEffect(() => {
        if (!docId) return;
        const docRef = doc(db, collectionName, docId);
        const unsubscribe = onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                setData({ id: doc.id, ...doc.data() });
            } else {
                console.log("No such document!");
                setData(null);
            }
        });
        return () => unsubscribe();
    }, [collectionName, docId]);
    return data;
};

// --- Animation Hook ---
const useScrollAnimation = () => {
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-visible');
                }
            });
        }, { threshold: 0.1 });

        const elements = document.querySelectorAll('.fade-in');
        elements.forEach(el => observer.observe(el));

        return () => elements.forEach(el => observer.unobserve(el));
    }, []);
};

// --- UI Components ---

const ThemeToggle = ({ theme, setTheme }) => {
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    };

    return (
        <button onClick={toggleTheme} className="p-2 rounded-full text-white hover:bg-blue-700 focus:outline-none transition-colors">
            <Icon path={theme === 'light' ? Icons.moon : Icons.sun} className="w-6 h-6" />
        </button>
    );
};


const Navbar = ({ setPage, setCurrentPostId, user, theme, setTheme }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navLinks = ["Home", "About", "Skills", "Projects", "Services", "Team", "Blog", "Contact"];

    const handleLinkClick = (pageName) => {
        const sectionId = pageName.toLowerCase();
        setPage('home');
        setCurrentPostId(null);
        setTimeout(() => {
            document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        setIsOpen(false);
    };
    
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 text-white bg-blue-900 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex-shrink-0">
                         <button onClick={() => handleLinkClick('Home')} className="font-bold text-2xl tracking-wider">Donatus Zure</button>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-center space-x-4">
                            {navLinks.map(link => (
                                <button key={link} onClick={() => handleLinkClick(link)} className="hover:bg-blue-800 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                    {link}
                                </button>
                            ))}
                            <ThemeToggle theme={theme} setTheme={setTheme} />
                            {user && (
                                <button onClick={() => setPage('admin')} className="bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-600 transition-colors">
                                    Admin
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center md:hidden">
                         <ThemeToggle theme={theme} setTheme={setTheme} />
                        <button onClick={() => setIsOpen(!isOpen)} className="ml-2 bg-blue-800 p-2 inline-flex items-center justify-center rounded-md text-white hover:bg-blue-700 focus:outline-none">
                            <span className="sr-only">Open main menu</span>
                            <Icon path={isOpen ? Icons.close : Icons.menu} />
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-900">
                        {navLinks.map(link => (
                            <button key={link} onClick={() => handleLinkClick(link)} className="hover:bg-blue-800 block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors">
                                {link}
                            </button>
                        ))}
                         {user && (
                            <button onClick={() => setPage('admin')} className="bg-indigo-500 mt-1 block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-600 transition-colors">
                                Admin Panel
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

const Section = ({ id, children, className = "", style = {} }) => (
    <section id={id} className={`py-20 md:py-28 px-4 transition-colors duration-500 ${className}`} style={style}>
        <div className="max-w-7xl mx-auto">
            {children}
        </div>
    </section>
);

const HeroSection = () => {
    const siteContent = useFirestoreDocument('site_content', 'main');
    const intro = siteContent?.hero || { title: "Welcome to my Digital Space", subtitle: "Software Developer | Graphic Designer | IT Consultant", text: "I build beautiful and functional applications for the web." };

    const backgroundImages = useMemo(() => [
        'https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=1931&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=1974&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop',
    ], []);

    const [currentBg, setCurrentBg] = useState(backgroundImages[0]);

    useEffect(() => {
        backgroundImages.forEach(image => {
            new Image().src = image;
        });

        const intervalId = setInterval(() => {
            setCurrentBg(prevBg => {
                const currentIndex = backgroundImages.indexOf(prevBg);
                const nextIndex = (currentIndex + 1) % backgroundImages.length;
                return backgroundImages[nextIndex];
            });
        }, 7000);

        return () => clearInterval(intervalId);
    }, [backgroundImages]);

    return (
        <Section 
            id="home" 
            className="text-white min-h-screen flex items-center justify-center text-center bg-cover bg-center"
            style={{ backgroundImage: `url(${currentBg})`, transition: 'background-image 1s ease-in-out' }}
        >
            <div className="absolute inset-0 bg-black/60"></div>
            <div className="relative z-10 p-4">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 leading-tight">{intro.title}</h1>
                <p className="text-lg md:text-2xl text-indigo-300 font-semibold mb-8">{intro.subtitle}</p>
                <p className="max-w-3xl mx-auto text-gray-200 text-md md:text-lg">{intro.text}</p>
            </div>
        </Section>
    );
};

const AboutSection = () => {
    const siteContent = useFirestoreDocument('site_content', 'main');
    const aboutData = siteContent?.about || {};
    const aboutText = aboutData.text || "Loading my story...";
    const imageUrl = aboutData.imageUrl || 'https://placehold.co/400x400/1e293b/ffffff?text=Donatus+Z';

    return (
        <Section id="about" className="bg-slate-100 dark:bg-gray-800">
            <div className="grid md:grid-cols-5 gap-12 items-center fade-in">
                <div className="md:col-span-2">
                    <img src={imageUrl} alt="Donatus Zure" className="rounded-lg shadow-2xl w-full h-auto object-cover transform hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="md:col-span-3">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">About Me</h2>
                    <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                        {aboutText}
                    </p>
                </div>
            </div>
        </Section>
    );
};

const SkillsSection = () => {
    const skills = useFirestoreCollection('skills');
    
    return (
        <Section id="skills" className="bg-white dark:bg-gray-900">
             <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12 fade-in">My Skillset</h2>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 fade-in">
                 {skills.map(skill => (
                     <div key={skill.id} className="text-center p-4 bg-slate-100 dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 transform hover:-translate-y-1">
                         <p className="font-semibold text-gray-700 dark:text-gray-200">{skill.name}</p>
                     </div>
                 ))}
             </div>
        </Section>
    );
};

const ProjectsSection = () => {
    const projects = useFirestoreCollection('projects');
    const featuredProjects = projects.filter(p => p.isFeatured);
    const otherProjects = projects.filter(p => !p.isFeatured);
    
    return (
        <Section id="projects" className="bg-slate-100 dark:bg-gray-800">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12 fade-in">My Projects</h2>
            
            <div className="space-y-16 mb-24">
                {featuredProjects.map(project => (
                    <div key={project.id} className="grid md:grid-cols-2 gap-8 md:gap-12 items-center fade-in">
                        <div className="md:order-last">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{project.title}</h3>
                            <p className="text-slate-600 dark:text-slate-300 mb-4">{project.description}</p>
                             <div className="flex space-x-4">
                                {project.link && <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-400 font-semibold">View Project &rarr;</a>}
                                {project.githubLink && <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-400 font-semibold"><Icon path={Icons.github} /></a>}
                            </div>
                        </div>
                         <img src={project.imageUrl || 'https://placehold.co/600x400/374151/FFFFFF?text=Project'} alt={project.title} className="rounded-lg shadow-2xl w-full h-auto object-cover transform hover:scale-105 transition-transform duration-300"/>
                    </div>
                ))}
            </div>

            <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-12 fade-in">More Projects</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 fade-in">
                {otherProjects.map(project => (
                    <div key={project.id} className="bg-white dark:bg-gray-900 rounded-lg shadow-xl hover:shadow-indigo-500/20 transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
                        <img src={project.imageUrl || 'https://placehold.co/600x400/374151/FFFFFF?text=Project'} alt={project.title} className="w-full h-48 object-cover"/>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{project.title}</h3>
                            <p className="text-slate-600 dark:text-slate-300 mb-4 text-sm h-20 overflow-y-auto">{project.description}</p>
                             <div className="flex space-x-4">
                                {project.link && <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-400 font-semibold text-sm">View Project &rarr;</a>}
                                {project.githubLink && <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-400 font-semibold"><Icon path={Icons.github} /></a>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Section>
    );
};

const ServicesSection = () => {
    const services = useFirestoreCollection('services');
    const serviceIcons = { code: Icons.code, design: Icons.design, consultancy: Icons.consultancy };

    return (
        <Section id="services" className="bg-white dark:bg-gray-900">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12 fade-in">Services I Offer</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 text-center fade-in">
                {services.map(service => (
                    <div key={service.id} className="p-8 bg-slate-100 dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 transform hover:-translate-y-1">
                        <div className="inline-block p-4 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mb-4">
                            <Icon path={serviceIcons[service.icon] || Icons.code} className="w-8 h-8 text-indigo-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{service.title}</h3>
                        <p className="text-slate-600 dark:text-slate-300">{service.description}</p>
                    </div>
                ))}
            </div>
        </Section>
    );
};

const TeamSection = () => {
    const teamMembers = useFirestoreCollection('teamMembers');

    return (
        <Section id="team" className="bg-white dark:bg-gray-900">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12 fade-in">Dedicated Team</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 fade-in">
                {teamMembers.map(member => (
                    <div key={member.id} className="text-center p-6 bg-slate-100 dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 transform hover:-translate-y-1">
                        <img src={member.imageUrl || 'https://placehold.co/128x128/1e293b/ffffff?text=Avatar'} alt={member.name} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{member.name}</h3>
                        <p className="text-indigo-500 mb-2">{member.title}</p>
                        <p className="text-slate-600 dark:text-slate-300 text-sm">{member.description}</p>
                    </div>
                ))}
            </div>
        </Section>
    );
};


const TestimonialsSection = () => {
    const testimonials = useFirestoreCollection('testimonials');
    
    return (
        <Section id="testimonials" className="bg-slate-100 dark:bg-gray-800">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12 fade-in">What Clients Say</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 fade-in">
                {testimonials.map(testimonial => (
                    <div key={testimonial.id} className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-xl">
                        <p className="text-slate-600 dark:text-slate-300 italic mb-4">"{testimonial.quote}"</p>
                        <p className="font-bold text-gray-900 dark:text-white">{testimonial.author}</p>
                        <p className="text-sm text-indigo-500">{testimonial.company}</p>
                    </div>
                ))}
            </div>
        </Section>
    );
};

const BlogSection = ({ setPage, setCurrentPostId }) => {
    const posts = useFirestoreCollection('blogPosts');

    const handleReadMore = (id) => {
        setPage('blogPost');
        setCurrentPostId(id);
    }

    return (
        <Section id="blog" className="bg-white dark:bg-gray-900">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12 fade-in">From My Blog</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 fade-in">
                {posts.slice(0, 3).map(post => ( 
                    <div key={post.id} className="bg-slate-100 dark:bg-gray-800 rounded-lg shadow-xl hover:shadow-indigo-500/20 transition-all duration-300 flex flex-col overflow-hidden transform hover:-translate-y-1">
                        <img src={post.imageUrl || 'https://placehold.co/600x400/374151/FFFFFF?text=Blog'} alt={post.title} className="w-full h-48 object-cover"/>
                        <div className="p-6 flex-grow flex flex-col">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{post.title}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{post.timestamp?.toLocaleDateString()}</p>
                            <p className="text-slate-600 dark:text-slate-300 mb-4 flex-grow text-sm">{post.summary}</p>
                            <button onClick={() => handleReadMore(post.id)} className="text-indigo-500 hover:text-indigo-400 font-semibold self-start text-sm">Read More &rarr;</button>
                        </div>
                    </div>
                ))}
            </div>
        </Section>
    );
};


const ContactSection = () => {
    const siteContent = useFirestoreDocument('site_content', 'main');
    const contactInfo = siteContent?.contact || { email: "prisdon33@gmail.com", phone: "+233533255446", resumeUrl: "" };

    return (
        <Section id="contact" className="bg-slate-100 dark:bg-gray-800">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12 fade-in">Get In Touch</h2>
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 fade-in">
                <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Contact Information</h3>
                    <div className="space-y-4">
                        <a href={`mailto:${contactInfo.email}`} className="flex items-center space-x-4 text-slate-600 dark:text-slate-300 hover:text-indigo-500">
                            <Icon path={Icons.email} className="w-6 h-6 text-indigo-500" />
                            <span>{contactInfo.email}</span>
                        </a>
                        <a href={`https://wa.me/${contactInfo.phone.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-4 text-slate-600 dark:text-slate-300 hover:text-indigo-500">
                            <Icon path={Icons.whatsapp} className="w-6 h-6 text-indigo-500" />
                            <span>{contactInfo.phone} (WhatsApp)</span>
                        </a>
                         <a href={`tel:${contactInfo.phone}`} className="flex items-center space-x-4 text-slate-600 dark:text-slate-300 hover:text-indigo-500">
                            <Icon path={Icons.phone} className="w-6 h-6 text-indigo-500" />
                            <span>{contactInfo.phone}</span>
                        </a>
                    </div>
                </div>
                 <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg flex flex-col items-center justify-center text-center">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Resume</h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-6">Find more details about my experience and qualifications.</p>
                    <a href={contactInfo.resumeUrl} download className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg">
                        <Icon path={Icons.download} className="w-6 h-6 mr-3" />
                        Download CV
                    </a>
                </div>
            </div>
        </Section>
    );
};

const Footer = () => {
    const siteContent = useFirestoreDocument('site_content', 'main');
    const socials = siteContent?.socials || {};

    return (
        <footer className="bg-blue-900 text-white py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="flex justify-center space-x-6 mb-4">
                    {socials.github && <a href={socials.github} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-300"><Icon path={Icons.github} /></a>}
                    {socials.linkedin && <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-300"><Icon path={Icons.linkedin} /></a>}
                    {socials.whatsapp && <a href={socials.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-300"><Icon path={Icons.whatsapp} /></a>}
                    {socials.facebook && <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-300"><Icon path={Icons.facebook} /></a>}
                    {socials.tiktok && <a href={socials.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-300"><Icon path={Icons.tiktok} /></a>}
                </div>
                <p>&copy; {new Date().getFullYear()} Donatus Zure. All rights reserved.</p>
            </div>
        </footer>
    );
};


const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [portfolioContext, setPortfolioContext] = useState(null);

    // Fetch all portfolio data once when the chatbot is opened
    useEffect(() => {
        if (isOpen && !portfolioContext) {
            const fetchAllData = async () => {
                const collections = ['skills', 'projects', 'services', 'blogPosts', 'testimonials', 'teamMembers'];
                let context = '';
                
                const siteContentDoc = await getDoc(doc(db, 'site_content', 'main'));
                if (siteContentDoc.exists()) {
                    context += `About Donatus: ${JSON.stringify(siteContentDoc.data().about)}\n`;
                    context += `Donatus's Contact Info: ${JSON.stringify(siteContentDoc.data().contact)}\n`;
                }

                for (const col of collections) {
                    const querySnapshot = await getDocs(collection(db, col));
                    const data = querySnapshot.docs.map(d => ({id: d.id, ...d.data()}));
                    context += `\n${col}:\n${JSON.stringify(data)}\n`;
                }
                setPortfolioContext(context);
                setChatHistory([{ role: 'model', parts: [{ text: "Hello! I'm Donatus's AI assistant. Ask me anything about his skills, projects, or experience." }] }]);
            };
            fetchAllData();
        }
    }, [isOpen, portfolioContext]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const newHistory = [...chatHistory, { role: 'user', parts: [{ text: userInput }] }];
        setChatHistory(newHistory);
        setUserInput('');
        setIsLoading(true);

        try {
            const prompt = `You are a helpful and friendly AI assistant for Donatus Zure's personal portfolio. 
            Your goal is to answer questions from potential clients or recruiters based ONLY on the information provided below. 
            Be concise and professional. If you don't know the answer from the context, say "I don't have that information, but you can reach out to Donatus directly."

            CONTEXT:
            ${portfolioContext}
            ---
            QUESTION:
            ${userInput}
            `;
            
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            const apiKey = process.env.REACT_APP_GEMINI_API_KEY; 
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify(payload)
            });
            
            if(!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const result = await response.json();
            
            let text = "Sorry, I encountered a problem. Please try again.";
            if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
                text = result.candidates[0].content.parts[0].text;
            }

            setChatHistory(prev => [...prev, { role: 'model', parts: [{ text }] }]);

        } catch (error) {
            console.error("Error with Gemini API:", error);
            setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: "My apologies, I'm having trouble connecting right now." }] }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const chatContainerRef = useRef(null);
    useEffect(() => {
        if(chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);


    return (
        <div className="fixed bottom-5 right-5 z-50">
            {isOpen && (
                <div className="bg-white dark:bg-gray-800 w-80 sm:w-96 h-[500px] rounded-lg shadow-2xl flex flex-col">
                    <div className="p-4 bg-indigo-600 text-white rounded-t-lg flex justify-between items-center">
                        <h3 className="font-bold">AI Assistant</h3>
                        <button onClick={() => setIsOpen(false)} className="text-white p-2 -m-2 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50">
                            <Icon path={Icons.close} className="w-6 h-6"/>
                        </button>
                    </div>
                    <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4">
                        {chatHistory.map((msg, index) => (
                           <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                               <div className={`p-3 rounded-lg max-w-xs whitespace-pre-wrap ${msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                                   {msg.parts[0].text}
                               </div>
                           </div>
                        ))}
                        {isLoading && (
                             <div className="flex justify-start">
                               <div className="p-3 rounded-lg max-w-xs bg-slate-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                   <div className="flex items-center space-x-2">
                                       <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                                       <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                       <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                                   </div>
                               </div>
                           </div>
                        )}
                    </div>
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center">
                        <input 
                            type="text" 
                            placeholder="Ask me anything..." 
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            className="w-full px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                        />
                         <button type="submit" disabled={isLoading} className="bg-indigo-600 text-white p-3 rounded-r-lg hover:bg-indigo-700 disabled:bg-indigo-400">
                             <Icon path={Icons.send} className="w-5 h-5"/>
                         </button>
                    </form>
                </div>
            )}
            {!isOpen && 
                <button onClick={() => setIsOpen(true)} className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-110">
                    <Icon path={Icons.chatbot} className="w-8 h-8" />
                </button>
            }
        </div>
    );
};


// --- Page Components ---

const BlogPostPage = ({ postId, setPage }) => {
    const post = useFirestoreDocument('blogPosts', postId);

    if (!post) {
        return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading post...</div>;
    }

    return (
        <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white pt-24">
            <div className="max-w-4xl mx-auto p-4 sm:p-8">
                <button onClick={() => setPage('home')} className="text-indigo-500 hover:text-indigo-400 font-semibold mb-8">&larr; Back to Home</button>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{post.title}</h1>
                <p className="text-slate-500 dark:text-slate-400 text-md mb-8">{post.createdAt?.toDate().toLocaleDateString()}</p>
                {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="w-full rounded-lg shadow-lg mb-8" />}
                <div className="prose prose-lg dark:prose-invert max-w-none whitespace-pre-line">
                    {post.content}
                </div>
            </div>
        </div>
    );
};

// --- Admin Panel Components ---

const AdminLogin = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            onLogin();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-sm">
                <h2 className="text-white text-2xl font-bold mb-6 text-center">Admin Login</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                        Login
                    </button>
                    {error && <p className="text-red-400 text-sm text-center pt-2">{error}</p>}
                </form>
            </div>
        </div>
    );
};

const EditForm = ({ item, setItem, onSave, onCancel, onFileChange, collectionName, fields }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 p-6 rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 capitalize">{item.id ? 'Edit' : 'New'} {collectionName.slice(0, -1)}</h3>
            <div className="space-y-4">
                {fields.map(field => (
                    <div key={field.name}>
                        <label className="block text-sm font-medium mb-1 capitalize">{field.label}</label>
                        {field.type === 'textarea' ? (
                            <textarea
                                rows={field.rows || 5}
                                value={item[field.name] || ''}
                                onChange={(e) => setItem({ ...item, [field.name]: e.target.value })}
                                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                            />
                        ) : field.type === 'file' ? (
                            <div>
                                <input
                                    type="file"
                                    onChange={(e) => onFileChange(e, field.name)}
                                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                                {item[field.name] && <img src={item[field.name]} alt="Upload preview" className="mt-2 h-20 rounded" />}
                            </div>
                        ) : field.type === 'checkbox' ? (
                            <input
                                type="checkbox"
                                checked={!!item[field.name]}
                                onChange={(e) => setItem({ ...item, [field.name]: e.target.checked })}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                           />
                        ) : (
                            <input
                                type={field.type || 'text'}
                                value={item[field.name] || ''}
                                onChange={(e) => setItem({ ...item, [field.name]: e.target.value })}
                                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                            />
                        )}
                    </div>
                ))}
            </div>
            <div className="flex justify-end space-x-4 mt-6">
                <button onClick={onCancel} className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500">Cancel</button>
                <button onClick={() => onSave(item)} className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-500">Save</button>
            </div>
        </div>
    </div>
);

const DeleteConfirmation = ({ onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-bold">Are you sure?</h3>
            <p className="text-gray-400 my-4">This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
                <button onClick={onCancel} className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500">Cancel</button>
                <button onClick={onConfirm} className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-500">Delete</button>
            </div>
        </div>
    </div>
);


const ContentEditor = ({ collectionName, fields }) => {
    const data = useFirestoreCollection(collectionName);
    const [editingItem, setEditingItem] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    const handleSave = async (item) => {
        const itemToSave = { ...item };
        delete itemToSave.id;

        if (!item.id) {
            itemToSave.createdAt = new Date();
        }

        try {
            if (item.id) {
                const docRef = doc(db, collectionName, item.id);
                await updateDoc(docRef, itemToSave);
            } else {
                await addDoc(collection(db, collectionName), itemToSave);
            }
            setEditingItem(null);
        } catch (error) {
            console.error("Error saving document: ", error);
        }
    };

    const confirmDelete = (id) => setShowDeleteConfirm(id);
    
    const handleDelete = async (id) => {
        try {
            await deleteDoc(doc(db, collectionName, id));
            setShowDeleteConfirm(null);
        } catch(error) {
            console.error("Error deleting document: ", error);
        }
    };
    
    const handleFileChange = async (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;

        const storageRef = ref(storage, `${collectionName}/${Date.now()}_${file.name}`);
        try {
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            setEditingItem(prev => ({ ...prev, [fieldName]: downloadURL }));
        } catch (error) {
            console.error("Error uploading file: ", error);
        }
    };

    return (
        <div className="p-4 sm:p-6 bg-gray-900 rounded-lg text-white">
            {editingItem && (
                 <EditForm
                    item={editingItem}
                    setItem={setEditingItem}
                    onSave={handleSave}
                    onCancel={() => setEditingItem(null)}
                    onFileChange={handleFileChange}
                    collectionName={collectionName}
                    fields={fields}
                />
            )}
            {showDeleteConfirm && <DeleteConfirmation onConfirm={() => handleDelete(showDeleteConfirm)} onCancel={() => setShowDeleteConfirm(null)} />}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold capitalize">{collectionName}</h2>
                <button onClick={() => setEditingItem({})} className="bg-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-500">Add New</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-700">
                           {fields.map(f => <th key={f.name} className="p-2 capitalize">{f.label}</th>)}
                           <th className="p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                {fields.map(f => (
                                    <td key={f.name} className="p-2 text-sm max-w-xs truncate">
                                      {f.type === 'file' ? <img src={item[f.name]} alt={item.title || 'database item'} className="h-10 rounded"/> : (f.type === 'checkbox' ? (item[f.name] ? 'Yes' : 'No') : item[f.name])}
                                    </td>
                                ))}
                                <td className="p-2 flex space-x-2">
                                    <button onClick={() => setEditingItem(item)} className="p-2 text-gray-400 hover:text-white"><Icon path={Icons.edit} className="w-5 h-5"/></button>
                                    <button onClick={() => confirmDelete(item.id)} className="p-2 text-gray-400 hover:text-red-500"><Icon path={Icons.trash} className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SiteContentEditor = () => {
    const [content, setContent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const docRef = doc(db, 'site_content', 'main');
        const setupContent = async () => {
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setContent(docSnap.data());
                } else {
                    console.log("Main content document not found. Creating a new one.");
                    const defaultContent = {
                        hero: { title: "Welcome!", subtitle: "Your Subtitle", text: "Your introduction." },
                        about: { text: "About you...", imageUrl: "" },
                        contact: { email: "your@email.com", phone: "Your Phone", resumeUrl: "" },
                        socials: { github: "", linkedin: "", facebook: "", tiktok: "", whatsapp: "" }
                    };
                    await setDoc(docRef, defaultContent);
                    setContent(defaultContent);
                }
            } catch (error) {
                console.error("Error fetching or creating site content:", error);
            }
            setIsLoading(false);
        };
        setupContent();
    }, []);

    const handleSave = async () => {
        if(!content) return;
        const docRef = doc(db, 'site_content', 'main');
        try {
            await updateDoc(docRef, content);
            const modal = document.createElement('div');
            modal.style.cssText = 'position:fixed; top:1rem; left:50%; transform:translateX(-50%); background-color:#10B981; color:white; padding:1rem; border-radius:0.5rem; z-index:100;';
            modal.textContent = "Content saved successfully!";
            document.body.appendChild(modal);
            setTimeout(() => document.body.removeChild(modal), 3000);
        } catch (error) {
            console.error("Error saving content: ", error);
        }
    };
    

    const handleFileChange = async (e, section, field) => {
        const file = e.target.files[0];
        if (!file) return;

        const storageRef = ref(storage, `site_content/${Date.now()}_${file.name}`);
        try {
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            
            setContent(prev => ({
                ...prev,
                [section]: { ...prev[section], [field]: downloadURL }
            }));

        } catch (error) {
             console.error("Error uploading file: ", error);
        }
    };

    if (isLoading) return <div className="text-white text-center p-10">Loading Content Editor...</div>;
    if (!content) return <div className="text-red-400 text-center p-10">Error loading site content. Check Firestore permissions.</div>

    return (
        <div className="p-6 bg-gray-900 rounded-lg text-white space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Main Site Content</h2>
                <button onClick={handleSave} className="bg-green-600 px-6 py-2 rounded-md hover:bg-green-500">Save All Changes</button>
            </div>

            <div className="p-4 bg-gray-800 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Hero Section</h3>
                <input value={content.hero?.title || ''} onChange={e => setContent({...content, hero: {...content.hero, title: e.target.value}})} className="w-full bg-gray-700 p-2 rounded mb-2 text-white" placeholder="Title"/>
                <input value={content.hero?.subtitle || ''} onChange={e => setContent({...content, hero: {...content.hero, subtitle: e.target.value}})} className="w-full bg-gray-700 p-2 rounded mb-2 text-white" placeholder="Subtitle"/>
                <textarea value={content.hero?.text || ''} onChange={e => setContent({...content, hero: {...content.hero, text: e.target.value}})} className="w-full bg-gray-700 p-2 rounded text-white" placeholder="Intro Text" rows="3"></textarea>
            </div>

            <div className="p-4 bg-gray-800 rounded-lg">
                <h3 className="font-bold text-lg mb-2">About Section</h3>
                <textarea value={content.about?.text || ''} onChange={e => setContent({...content, about: {...content.about, text: e.target.value}})} className="w-full bg-gray-700 p-2 rounded mb-2 text-white" placeholder="About Me Text" rows="5"></textarea>
                <label className="block text-sm font-medium my-2">Profile Picture</label>
                <input type="file" onChange={(e) => handleFileChange(e, 'about', 'imageUrl')} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                {content.about?.imageUrl && <img src={content.about.imageUrl} alt="About me preview" className="h-20 mt-2 rounded" />}
             </div>
            
             <div className="p-4 bg-gray-800 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Contact & Socials</h3>
                <input value={content.contact?.email || ''} onChange={e => setContent({...content, contact: {...content.contact, email: e.target.value}})} className="w-full bg-gray-700 p-2 rounded mb-2 text-white" placeholder="Email"/>
                <input value={content.contact?.phone || ''} onChange={e => setContent({...content, contact: {...content.contact, phone: e.target.value}})} className="w-full bg-gray-700 p-2 rounded mb-2 text-white" placeholder="Phone"/>
                <label className="block text-sm font-medium my-2">CV / Resume File (Upload new to replace)</label>
                <input type="file" onChange={(e) => handleFileChange(e, 'contact', 'resumeUrl')} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                {content.contact?.resumeUrl && <a href={content.contact.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 text-sm mt-2 block hover:underline">Current CV Link</a>}
                
                <h3 className="font-bold text-lg mt-6 mb-2">Social Media Links</h3>
                <input value={content.socials?.github || ''} onChange={e => setContent({...content, socials: {...content.socials, github: e.target.value}})} className="w-full bg-gray-700 p-2 rounded mb-2 text-white" placeholder="GitHub URL"/>
                <input value={content.socials?.linkedin || ''} onChange={e => setContent({...content, socials: {...content.socials, linkedin: e.target.value}})} className="w-full bg-gray-700 p-2 rounded mb-2 text-white" placeholder="LinkedIn URL"/>
                <input value={content.socials?.whatsapp || ''} onChange={e => setContent({...content, socials: {...content.socials, whatsapp: e.target.value}})} className="w-full bg-gray-700 p-2 rounded mb-2 text-white" placeholder="WhatsApp Link (e.g., https://wa.me/233...)"/>
                <input value={content.socials?.facebook || ''} onChange={e => setContent({...content, socials: {...content.socials, facebook: e.target.value}})} className="w-full bg-gray-700 p-2 rounded mb-2 text-white" placeholder="Facebook URL"/>
                <input value={content.socials?.tiktok || ''} onChange={e => setContent({...content, socials: {...content.socials, tiktok: e.target.value}})} className="w-full bg-gray-700 p-2 rounded mb-2 text-white" placeholder="TikTok URL"/>
            </div>

        </div>
    );
};

const AdminDashboard = ({ onLogout, setPage }) => {
    return (
        <div className="bg-gray-800 text-white min-h-screen">
             <header className="bg-gray-900 p-4 flex justify-between items-center shadow-lg sticky top-0 z-40">
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <div>
                    <button onClick={() => setPage('home')} className="mr-4 text-gray-300 hover:text-white">View Site</button>
                    <button onClick={onLogout} className="bg-red-600 px-4 py-2 rounded-md hover:bg-red-700">Logout</button>
                </div>
            </header>
            <main className="p-4 md:p-8 space-y-8">
                <SiteContentEditor />
                 <ContentEditor
                    collectionName="blogPosts"
                    fields={[
                        { name: 'title', label: 'Title' },
                        { name: 'summary', label: 'Summary', type: 'textarea', rows: 3 },
                        { name: 'content', label: 'Full Content', type: 'textarea', rows: 15 },
                        { name: 'imageUrl', label: 'Header Image', type: 'file' },
                    ]}
                />
                <ContentEditor
                    collectionName="testimonials"
                    fields={[
                        { name: 'quote', label: 'Quote', type: 'textarea', rows: 4 },
                        { name: 'author', label: 'Author' },
                        { name: 'company', label: 'Company' },
                    ]}
                />
                <ContentEditor
                    collectionName="projects"
                    fields={[
                        { name: 'title', label: 'Title' },
                        { name: 'isFeatured', label: 'Featured?', type: 'checkbox' },
                        { name: 'description', label: 'Description', type: 'textarea' },
                        { name: 'link', label: 'Project URL' },
                        { name: 'githubLink', label: 'GitHub URL' },
                         { name: 'imageUrl', label: 'Image', type: 'file' },
                    ]}
                />
                 <ContentEditor
                    collectionName="teamMembers"
                    fields={[
                        { name: 'name', label: 'Name' },
                        { name: 'title', label: 'Title' },
                        { name: 'description', label: 'Description', type: 'textarea' },
                        { name: 'imageUrl', label: 'Photo', type: 'file' },
                    ]}
                />
                <ContentEditor
                    collectionName="skills"
                    fields={[{ name: 'name', label: 'Skill Name' }]}
                />
                 <ContentEditor
                    collectionName="services"
                    fields={[
                        { name: 'title', label: 'Service Title' },
                        { name: 'description', label: 'Description', type: 'textarea' },
                        { name: 'icon', label: 'Icon (code, design, or consultancy)' },
                    ]}
                />
            </main>
        </div>
    );
};


// --- Main App Component ---
export default function App() {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
    const [page, setPage] = useState('home');
    const [currentPostId, setCurrentPostId] = useState(null);
    const [user, setUser] = useState(null);
    const [authReady, setAuthReady] = useState(false);
    
    useScrollAnimation();

    useEffect(() => {
        const path = window.location.pathname;
        if (path === '/admin') {
            setPage('admin');
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthReady(true);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        setPage('home');
    };
    
    // Simple Router
    const renderPage = () => {
        switch (page) {
            case 'admin':
                return user ? (
                    <AdminDashboard onLogout={handleLogout} setPage={setPage} />
                ) : (
                    <AdminLogin onLogin={() => setPage('admin')} />
                );
            case 'blogPost':
                 return (
                    <div className="bg-white dark:bg-gray-900">
                        <Navbar user={user} setPage={setPage} setCurrentPostId={setCurrentPostId} theme={theme} setTheme={setTheme} />
                        <BlogPostPage postId={currentPostId} setPage={setPage} />
                        <Footer />
                    </div>
                 );
            case 'home':
            default:
                return (
                    <div className="bg-white dark:bg-gray-900">
                        <Navbar user={user} setPage={setPage} setCurrentPostId={setCurrentPostId} theme={theme} setTheme={setTheme} />
                        <main>
                            <HeroSection />
                            <AboutSection />
                            <SkillsSection />
                            <ProjectsSection />
                            <ServicesSection />
                            <TestimonialsSection />
                            <TeamSection />
                            <BlogSection setPage={setPage} setCurrentPostId={setCurrentPostId} />
                            <ContactSection />
                        </main>
                        <Footer />
                        <Chatbot />
                    </div>
                );
        }
    };

    if (!authReady) {
        return <div className="bg-gray-900 min-h-screen flex items-center justify-center text-white text-xl">Prisdon</div>;
    }

    return renderPage();
}
