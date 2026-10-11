/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

export default function Marca() {
  return (
    <Link className="marca" href="/#inicio">
      <img src="/globo.webp" alt="" width={44} height={44} style={{ objectFit: "contain" }} />
      <b>
        INNOVATION <span>3D</span>
      </b>
    </Link>
  );
}
