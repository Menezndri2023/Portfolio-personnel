import { notFound } from "next/navigation";

/** Toute URL inconnue du site public affiche la page 404 dans la bonne langue. */
export default function CatchAll() {
  notFound();
}
