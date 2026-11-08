import { MyComposition } from "./Composition";
import { CharTest } from "./CharTest";
import { CharTest2 } from "./CharTest2";
import { Episode2 } from "./Episode2";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <CharTest />
      <CharTest2 />
      <Episode2 />
    </>
  );
};
