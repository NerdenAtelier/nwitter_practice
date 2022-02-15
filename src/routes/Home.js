//로그인 후 보일 화면 - 트윗/사진 등록 및 조회

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { dbService, fileService } from "fbase";
import Nweet from "components/Nweet";
import { v4 as uuidv4 } from "uuid";

const Home = ({ userObj }) => {
  const [nweet, setNweet] = useState("");
  const [nweets, setNweets] = useState([]);
  const [attachment, setAttachment] = useState(""); //image url status

  //   const getNweets = async () => {
  //     const dbNweets = await getDocs(collection(dbService, "nweets"));
  //     dbNweets.forEach((document) => {
  //       const nweetObject = { ...document.data(), id: document.id };
  //       setNweets((prev) => [nweetObject, ...prev]);
  //     });
  //   };

  useEffect(() => {
    onSnapshot(collection(dbService, "nweets"), (snapshot) => {
      const newArray = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));
      setNweets(newArray);
    });
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();

    let attachmentUrl = "";

    if (attachment !== "") {
      let address = `${userObj.uid}/${uuidv4()}`;
      const attachmentRef = ref(fileService, address);
      const response = await uploadString(
        attachmentRef,
        attachment,
        "data_url"
      );
      attachmentUrl = await getDownloadURL(ref(fileService, address));
    }

    await addDoc(collection(dbService, "nweets"), {
      text: nweet,
      createdAt: Date.now(),
      creatorId: userObj.uid,
      attachmentUrl,
    }); //'nweets'라는 firestore 내부의 collection에 자동생성된 id로 해당 문서를 add 하라는 뜻

    setNweet("");
    setAttachment("");
  };

  const onChange = (event) => {
    event.preventDefault();
    const {
      target: { value },
    } = event;
    setNweet(value);
  };

  const onFileChange = (event) => {
    const {
      target: { files },
    } = event;
    const theFile = files[0];
    const reader = new FileReader();
    reader.onloadend = (finishedEvent) => {
      const {
        currentTarget: { result },
      } = finishedEvent;
      setAttachment(result);
    };
    reader.readAsDataURL(theFile);
  };

  const onClearAttachment = () => {
    setAttachment("");
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <input
          value={nweet}
          onChange={onChange}
          type="text"
          placeholder="What's on your mind?"
          maxLength={120}
        />
        <input type="file" accept="image/*" onChange={onFileChange} />
        <input type="submit" value="Nweet" />
        {attachment && (
          <div>
            <img src={attachment} width="50px" height="50px" />
            <button onClick={onClearAttachment}>Clear</button>
          </div>
        )}
      </form>
      <div>
        {nweets.map((nweet) => (
          <Nweet
            key={nweet.id}
            nweetObj={nweet}
            isOwner={nweet.creatorId === userObj.uid}
          />
        ))}
      </div>
    </>
  );
};

export default Home;
