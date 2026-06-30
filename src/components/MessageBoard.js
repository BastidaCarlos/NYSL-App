import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../utilities/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const MessageBoard = ({gameId}) => {
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState('');
    const [user] = useAuthState(auth);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const messagesRef = collection(db, 'games', gameId, 'messages'); 
        const messageQuery = query(messagesRef, orderBy('timestamp'));

        const unsuscribe = onSnapshot(messageQuery, (snapshot) => {
            const messageList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(messageList);
        });
        return unsuscribe;

    }, [gameId]);

    useEffect(() => {
        const fetchUser = async () => {
            if(!user) return;
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            setUserName(userSnap.data()?.name)
        }
        fetchUser();
    }, [user])

    const handleSendMessage = async () => {
        if (newMessage.trim() === '') {
            setError('You cannot send an empty message')
            return;
        }
        if (!user) {
            setError('You cannot send messages')
            return;
        }

        try {
            const message = {
                autor: userName,
                uid: user.uid,
                text: newMessage,
                timestamp: serverTimestamp()
            } 
            await addDoc(collection(db, 'games', gameId, 'messages'), message);
            setNewMessage('');
        } catch (error) {
            setError('The message could not be sent')
        }
    }

    return (
        <div>
            <div>
                {
                    messages.map((message) => (
                        <div key={message.id}>
                            <strong>{message.autor}</strong>
                            <p>{message.text}</p>
                            <span className="text-muted">{message.timestamp?.toDate().toLocaleTimeString()}</span>
                        </div>
                    ))
                }
            </div>
            <div>
                {!user ? (<p className="disclaimer">Sign In!</p>) : (
                    <>
                        <input 
                            type="text"
                            placeholder="Message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={handleSendMessage}
                        >
                            Send
                        </button>
                    </>
                )}
            </div>
            <p>{error}</p>
        </div>
    )

}

export default MessageBoard;