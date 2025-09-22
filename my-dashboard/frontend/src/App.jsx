import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Storage keys
const STORAGE_KEYS = {
    USERS: 'ds_users',
    SESSION: 'ds_session',
    POSTS: 'ds_posts',
    CONNECTIONS: 'ds_conns',
    COMMUNITIES: 'ds_communities',
};

const load = (key, fallback) => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
};
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));

export default function App() {
  // State
const [users, setUsers] = useState(() => load(STORAGE_KEYS.USERS, []));
const [session, setSession] = useState(() => load(STORAGE_KEYS.SESSION, null));
const [posts, setPosts] = useState(() => load(STORAGE_KEYS.POSTS, []));
const [conns, setConns] = useState(() => load(STORAGE_KEYS.CONNECTIONS, []));
const [communities, setCommunities] = useState(() => load(STORAGE_KEYS.COMMUNITIES, []));
const [query, setQuery] = useState('');
const [searchResults, setSearchResults] = useState(null);

const currentUser = users.find(u => u.id === session?.userId) || null;

// Save to storage
useEffect(() => save(STORAGE_KEYS.USERS, users), [users]);
useEffect(() => save(STORAGE_KEYS.SESSION, session), [session]);
useEffect(() => save(STORAGE_KEYS.POSTS, posts), [posts]);
useEffect(() => save(STORAGE_KEYS.CONNECTIONS, conns), [conns]);
useEffect(() => save(STORAGE_KEYS.COMMUNITIES, communities), [communities]);

// Auth
function signup({ name, email, password }) {
if (users.some(u => u.email === email)) return { ok: false, message: 'Email exists' };
const newUser = { id: uuidv4(), name, email, password };
setUsers([...users, newUser]);
setSession({ userId: newUser.id });
return { ok: true };
}
function login({ email, password }) {
const u = users.find(x => x.email === email && x.password === password);
if (!u) return { ok: false, message: 'Invalid credentials' };
setSession({ userId: u.id });
return { ok: true };
}
function logout() { setSession(null); }

// Posts
function createPost(text) {
if (!currentUser) return;
const p = { id: uuidv4(), text, authorId: currentUser.id, createdAt: Date.now() };
setPosts([p, ...posts]);
}

// Connections
async function addConnection({ name, location }) {
let lat = 1.3521, lng = 103.8198;
try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
    const data = await res.json();
    if (data && data[0]) { lat = parseFloat(data[0].lat); lng = parseFloat(data[0].lon); }
} catch {}
const c = { id: uuidv4(), name, location, lat, lng };
setConns([c, ...conns]);
}

// Communities
function createCommunity(name) {
const c = { id: uuidv4(), name, members: [currentUser?.id] };
setCommunities([c, ...communities]);
}

  // Search
function handleSearch(q) {
setQuery(q);
if (!q.trim()) return setSearchResults(null);
const ql = q.toLowerCase();
setSearchResults({
    users: users.filter(u => u.name.toLowerCase().includes(ql)),
    posts: posts.filter(p => p.text.toLowerCase().includes(ql)),
    communities: communities.filter(c => c.name.toLowerCase().includes(ql)),
});
}

return (
<div className="min-h-screen bg-green-50">
    <div className="max-w-7xl mx-auto p-4">
    {/* Header */}
    <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
        <input value={query} onChange={e => handleSearch(e.target.value)} placeholder="Search..." className="border px-2 rounded" />
        {session && <button onClick={logout} className="bg-red-400 px-2 py-1 text-white rounded">Logout</button>}
        </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left: Profile & Connections */}
        <aside className="md:col-span-3 bg-white p-3 rounded shadow">
        {currentUser ? (
            <div className="mb-4">
            <div className="font-bold">{currentUser.name}</div>
            <div className="text-xs text-gray-500">{currentUser.email}</div>
            </div>
        ) : <Auth login={login} signup={signup} />}
        <h3 className="font-semibold mb-2">Connections</h3>
        <div className="space-y-1">
            {conns.map(c => <div key={c.id}>{c.name} ({c.location})</div>)}
            {conns.length === 0 && <div className="text-sm text-gray-400">No connections</div>}
        </div>
        </aside>

        {/* Center: Posts */}
        <main className="md:col-span-6 space-y-4">
        {currentUser && <CreatePost onCreate={createPost} />}
        {searchResults ? (
            <SearchResults results={searchResults} query={query} />
        ) : (
            posts.map(p => (
            <div key={p.id} className="bg-white p-3 rounded shadow">
                <div className="font-semibold">{users.find(u => u.id === p.authorId)?.name || "Unknown"}</div>
                <div className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleString()}</div>
                <p>{p.text}</p>
            </div>
            ))
        )}
        </main>

        {/* Right: Communities & Map */}
        <aside className="md:col-span-3 space-y-4">
        <div className="bg-white p-3 rounded shadow">
            <h3 className="font-semibold mb-2">Communities</h3>
            <button onClick={() => createCommunity(prompt("Community name?"))} className="text-sm bg-blue-500 text-white px-2 py-1 rounded">+ Create</button>
            <ul className="mt-2 space-y-1">
            {communities.map(c => <li key={c.id}>{c.name}</li>)}
            {communities.length === 0 && <div className="text-xs text-gray-400">No communities</div>}
            </ul>
        </div>
        <div className="bg-white p-3 rounded shadow h-64">
            <h3 className="font-semibold mb-2">Connections Map</h3>
            <MapContainer center={[1.3521, 103.8198]} zoom={2} style={{ height: "80%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {conns.map(c => (
                <Marker key={c.id} position={[c.lat, c.lng]}>
                <Popup>{c.name} - {c.location}</Popup>
                </Marker>
            ))}
            </MapContainer>
            <button onClick={() => addConnection({ name: prompt("Name?"), location: prompt("Location?") })} className="mt-2 text-sm bg-green-600 text-white px-2 py-1 rounded">+ Add Connection</button>
        </div>
        </aside>
    </div>
    </div>
</div>
);
}

// Login/Signup
function Auth({ login, signup }) {
    const [mode, setMode] = useState("login");
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [msg, setMsg] = useState("");

    function handleSubmit(e) {
        e.preventDefault();
        setMsg("");
        const r = mode === "login" ? login(form) : signup(form);
        if (!r.ok) setMsg(r.message);
    }

    return (
        <form onSubmit={handleSubmit} className="mb-4">
        <h3 className="font-semibold mb-2">{mode === "login" ? "Login" : "Sign Up"}</h3>
        {mode === "signup" && <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border w-full mb-2 p-1 rounded" />}
        <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="border w-full mb-2 p-1 rounded" />
        <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="border w-full mb-2 p-1 rounded" />
        <button className="bg-green-600 text-white px-2 py-1 rounded w-full">{mode === "login" ? "Login" : "Sign Up"}</button>
        <div className="text-xs text-blue-500 cursor-pointer mt-2" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
            {mode === "login" ? "Need an account? Sign Up" : "Have an account? Login"}
        </div>
        {msg && <div className="text-red-500 text-xs mt-1">{msg}</div>}
        </form>
    );
}

// Post box
function CreatePost({ onCreate }) {
    const [text, setText] = useState("");
    return (
        <div className="bg-white p-3 rounded shadow">
        <textarea className="border w-full p-2 rounded mb-2" rows="2" value={text} onChange={e => setText(e.target.value)} placeholder="What's on your mind?" />
        <button onClick={() => { if (text.trim()) { onCreate(text); setText(""); } }} className="bg-blue-600 text-white px-3 py-1 rounded">Post</button>
        </div>
    );
}

// Search results
function SearchResults({ results, query }) {
    const none = !results.users.length && !results.posts.length && !results.communities.length;
    if (none) return <div className="bg-white p-3 rounded shadow">No results found for "{query}"</div>;
    return (
        <div className="space-y-4">
        {results.users.length > 0 && <div className="bg-white p-3 rounded shadow"><h4 className="font-semibold">Users</h4>{results.users.map(u => <div key={u.id}>{u.name}</div>)}</div>}
        {results.posts.length > 0 && <div className="bg-white p-3 rounded shadow"><h4 className="font-semibold">Posts</h4>{results.posts.map(p => <div key={p.id}>{p.text}</div>)}</div>}
        {results.communities.length > 0 && <div className="bg-white p-3 rounded shadow"><h4 className="font-semibold">Communities</h4>{results.communities.map(c => <div key={c.id}>{c.name}</div>)}</div>}
        </div>
    );
}
