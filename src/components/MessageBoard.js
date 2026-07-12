import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../utilities/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
// Imports Styles and Icons
import style from '../styles/MessageBoard.module.css'
import { Send } from "lucide-react";

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
        <section className={style.boardSection}>
            <h2 className={style.boardTitle}>Messages Board</h2>

            <div className={style.messagesContainer}>
                {messages.map((message) => (
                    <div key={message.id} className={style.messageGroup}>
                        <span className={style.authorName}>{message.autor}</span>
                        <div className={style.messageBubble}>
                            <p className={style.messageText}>{message.text}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className={style.inputArea}>
                {!user ? (
                    <p className={style.loginDisclaimer}>Sign In to participate in the board!</p>
                ) : (
                    <div className={style.inputWrapper}>
                        <input 
                            type="text"
                            placeholder="Write a message ..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            className={style.messageInput}

                        />
                        <button 
                            type="button"
                            onClick={handleSendMessage}
                            className={style.sendBtn}
                            aria-label="Send Message"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                )}
            </div>
            {error && <p className={style.errorText}>{error}</p>}
        </section>
    );
};

export default MessageBoard;