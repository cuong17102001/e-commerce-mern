import React, { Fragment, createContext, useReducer } from "react";
import { chatReducer, chatState } from "./ChatContext";
import AdminLayout from "../layout";
import ChatAdmin from "./chatAdmin";
export const ChatContext = createContext();

const ChatComponent = () => {
    return (
        <div className="grid grid-cols-1 space-y-4 p-4">
<ChatAdmin/>
        </div>
    );
};

const Chats = (props) => {
    const [data, dispatch] = useReducer(chatReducer, chatState);
    return (
        <Fragment>
            <ChatContext.Provider value={{ data, dispatch }}>
                <AdminLayout children={<ChatComponent />} />
            </ChatContext.Provider>
        </Fragment>
    );
};

export default Chats;