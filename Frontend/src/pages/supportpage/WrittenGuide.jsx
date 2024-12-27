import { useState } from "react";
import { FaArrowLeftLong, FaPrint } from "react-icons/fa6";
import { Link } from "react-router-dom";

const WrittenGuide = () => {
  const [zoomLevel, setZoomLevel] = useState(100);

  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 10, 200));

  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 10, 50));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col w-full gap-8">
      <div className="flex gap-4 items-center p-2">
        <Link to={"/advertiser/support"}>
          <FaArrowLeftLong />
        </Link>
        <h1 className="text-xl">Written Guide</h1>
      </div>
      <div className="flex items-center justify-between bg-blue-500 text-white px-4 py-2">
        <div className="text-xl font-semibold">Written Guide</div>
        <div className="flex items-center gap-4">
          <div className="text-lg bg-[#A7B0FF] px-4 py-2">1</div>
          <div className="">|</div>
          <button onClick={zoomOut} className="text-white">
            -
          </button>
          <div className="px-4 py-2 items-center flex justify-center bg-[#A7B0FF] w-20">
            {zoomLevel}%
          </div>
          <button onClick={zoomIn} className="text-white">
            +
          </button>
        </div>
        <div onClick={handlePrint} className="text-white">
          <FaPrint className="w-6 h-6" />
        </div>
      </div>
      <div
        className="flex flex-col gap-4 bg-white px-16 py-8 overflow-auto"
        style={{
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: "top left",
        }}
      >
        <p className="text2xl">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
          nesciunt praesentium inventore eligendi voluptates suscipit velit
          nostrum voluptas illum, natus, iste autem sit quaerat minima aperiam
          amet numquam repellat perferendis. Distinctio fugit soluta inventore
          harum magni excepturi minima molestias aspernatur explicabo dicta ex
          reprehenderit, cumque sit enim ipsam nobis temporibus, et minus
          voluptate, dolorum rerum! Praesentium minima et eum fugit saepe, animi
          fuga sed placeat commodi aperiam expedita quod temporibus, architecto
          corrupti minus cupiditate facilis possimus sunt, ut magni quo.
        </p>
        <p className="text2xl">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatem,
          suscipit facilis. Temporibus, obcaecati a! In doloremque, cumque
          accusantium quia hic aspernatur dolores, eum totam quod laborum quo.
          Dolor facilis animi dignissimos asperiores adipisci corrupti
          architecto ratione minima amet nesciunt explicabo quisquam voluptatum
          veritatis nihil aliquam consequuntur eaque, unde quae aliquid dolore
          porro ullam maxime? Necessitatibus soluta repellendus consequuntur
          impedit tempora?
        </p>
        <p className="text2xl">
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Magni sunt
          atque commodi dolore aperiam quae, tenetur exercitationem esse
          reiciendis tempora sint temporibus quas maiores ea pariatur
          reprehenderit modi ipsa ut neque officiis nisi. Nam labore minus
          deleniti quasi laborum vitae magnam alias, sapiente illo qui nisi
          accusantium libero iusto inventore totam voluptatem neque blanditiis,
          assumenda, doloremque aliquid unde? Reiciendis omnis nihil quibusdam
          repellat itaque adipisci est laboriosam explicabo. Tenetur, nam
          pariatur omnis alias perferendis unde, veniam animi neque repellat
          vitae inventore illum ea adipisci eligendi excepturi voluptatem
          doloribus quidem doloremque sapiente in, sint quasi rerum. Ducimus
          iusto iure, laudantium rem facilis cum ullam sapiente delectus
          possimus ea quae quibusdam, autem est beatae ad labore, sed vero sequi
          commodi ipsum inventore.
        </p>
        <p className="text2xl">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur
          nesciunt quasi, modi temporibus eligendi autem consectetur iste,
          expedita molestias ratione aliquid deleniti voluptate hic harum? Est
          ad facilis cum repudiandae consequatur quibusdam distinctio quaerat
          similique officiis architecto voluptatem aspernatur, et quas iure
          laboriosam quo dolor? Tenetur earum esse quis aspernatur.
        </p>
        <p className="text2xl">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat at
          aliquid sit ducimus earum, porro sed, suscipit quibusdam omnis
          maiores, molestias ab harum! Error sint quam voluptate numquam
          delectus quae fugit unde, saepe reiciendis magni quaerat reprehenderit
          similique, eum fugiat.
        </p>
        <p className="text2xl">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quo iusto
          sunt totam amet molestias mollitia, voluptas sit laudantium fugiat
          possimus, modi non eligendi doloremque aut sint neque quaerat
          inventore aliquid illo unde, consequuntur laborum nesciunt. A,
          praesentium? Cum dignissimos aliquid tenetur neque. Necessitatibus
          quibusdam eos velit rerum laborum, enim dignissimos, qui itaque ullam
          fuga eum placeat sed dolores, harum animi optio nostrum ut adipisci
          iusto aliquam veritatis? Dolores odio corporis sint dolore quae error,
          libero consectetur? Error possimus recusandae quisquam, eos quia,
          rerum cumque nostrum similique consectetur, assumenda repellendus
          laudantium.
        </p>
      </div>
    </div>
  );
};

export default WrittenGuide;
