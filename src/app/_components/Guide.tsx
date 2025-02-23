import {
  Modal,
  ModalContent,
  ModalBody,
  useDisclosure,
  Link,
} from "@heroui/react";
import Image from "next/image";

function Guide() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  return (
    <>
      <Link className="cursor-pointer" onPress={onOpen}>
        guide
      </Link>
      <Modal
        size="xl"
        isOpen={isOpen}
        scrollBehavior="outside"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          <ModalBody>
            <p>1. Copy your player link (dont leak it)</p>
            <Image src="/Guide1.jpg" alt="guide 1" width={1280} height={720} />
            <p>2. Add new browser source</p>
            <Image src="/Guide2.jpg" alt="guide 2" width={1280} height={720} />
            <p>3. Paste player link into url field </p>
            <p>4. Set width to anything you feel like it </p>
            <p>5. Set height to 128</p>
            <p>6. Check control audio via obs</p>
            <Image src="/Guide3.jpg" alt="guide 3" width={1280} height={720} />
            <p>7. Open advanced audio properties </p>
            <p>
              8. set audio monitoring for player to &quot;monitor and
              output&quot;
            </p>
            <Image src="/Guide4.jpg" alt="guide 4" width={1280} height={720} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default Guide;
