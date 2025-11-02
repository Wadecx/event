export enum EventCategory {
  CONCERT = "CONCERT",
  CONFERENCE = "CONFERENCE",
  WORKSHOP = "WORKSHOP",
  SPORT = "SPORT",
  THEATER = "THEATER",
}

export enum ReservationStatus {
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  PENDING = "PENDING",
}

export interface Event {
  id: string;
  nom: string;
  date: Date;
  lieu: string;
  capaciteMaximale: number;
  placesDisponibles: number;
  categorie: EventCategory;
  prix: number;
}

export interface User {
  id: string;
  nom: string;
  email: string;
}

export interface Reservation {
  id: string;
  utilisateurId: string;
  evenementId: string;
  nombrePlaces: number;
  dateReservation: Date;
  statut: ReservationStatus;
}

const evenements: Event[] = [];
const utilisateurs: User[] = [];
const reservations: Reservation[] = [];

function genererId(prefix: string = ""): string {
  return `${prefix}${Date.now().toString(36)}-${Math.floor(
    Math.random() * 10000
  ).toString(36)}`;
}

function trouverEvenementParId(id: string): Event | undefined {
  return evenements.find((e) => e.id === id);
}

function trouverUtilisateurParId(id: string): User | undefined {
  return utilisateurs.find((u) => u.id === id);
}

function trouverReservationParId(id: string): Reservation | undefined {
  return reservations.find((r) => r.id === id);
}

export function creerEvenement(
  nom: string,
  date: Date,
  lieu: string,
  capaciteMaximale: number,
  categorie: EventCategory,
  prix: number
): Event {
  const nouvelEvenement: Event = {
    id: genererId("evt-"),
    nom,
    date,
    lieu,
    capaciteMaximale,
    placesDisponibles: capaciteMaximale,
    categorie,
    prix,
  };
  evenements.push(nouvelEvenement);
  return nouvelEvenement;
}

export function listerEvenements(): Event[] {
  return [...evenements];
}

export function filtrerEvenementsParCategorie(
  categorie: EventCategory
): Event[] {
  return evenements.filter((e) => e.categorie === categorie);
}

export function filtrerEvenementsDisponibles(): Event[] {
  return evenements.filter((e) => e.placesDisponibles > 0);
}

export function rechercherEvenementParNom(terme: string): Event[] {
  const recherche = terme.trim().toLowerCase();
  if (!recherche) return [];
  return evenements.filter((e) => e.nom.toLowerCase().includes(recherche));
}

export function creerUtilisateur(nom: string, email: string): User {
  const nouvelUtilisateur: User = {
    id: genererId("usr-"),
    nom,
    email,
  };
  utilisateurs.push(nouvelUtilisateur);
  return nouvelUtilisateur;
}

export function listerUtilisateurs(): User[] {
  return [...utilisateurs];
}

export function creerReservation(
  utilisateurId: string,
  evenementId: string,
  nombrePlaces: number
): Reservation {
  const utilisateur = trouverUtilisateurParId(utilisateurId);
  if (!utilisateur) throw new Error("Utilisateur introuvable");

  const evenement = trouverEvenementParId(evenementId);
  if (!evenement) throw new Error("Événement introuvable");

  if (nombrePlaces <= 0)
    throw new Error("Le nombre de places doit être supérieur à zéro");

  if (evenement.placesDisponibles < nombrePlaces) {
    throw new Error(
      `Places insuffisantes — disponible: ${evenement.placesDisponibles}`
    );
  }

  evenement.placesDisponibles -= nombrePlaces;

  const nouvelleReservation: Reservation = {
    id: genererId("res-"),
    utilisateurId,
    evenementId,
    nombrePlaces,
    dateReservation: new Date(),
    statut: ReservationStatus.CONFIRMED,
  };

  reservations.push(nouvelleReservation);
  return nouvelleReservation;
}

export function annulerReservation(reservationId: string): Reservation {
  const reservation = trouverReservationParId(reservationId);
  if (!reservation) throw new Error("Réservation introuvable");

  if (reservation.statut === ReservationStatus.CANCELLED) {
    return reservation;
  }

  const evenement = trouverEvenementParId(reservation.evenementId);
  if (!evenement) {
    reservation.statut = ReservationStatus.CANCELLED;
    return reservation;
  }

  evenement.placesDisponibles += reservation.nombrePlaces;
  if (evenement.placesDisponibles > evenement.capaciteMaximale) {
    evenement.placesDisponibles = evenement.capaciteMaximale;
  }

  reservation.statut = ReservationStatus.CANCELLED;
  return reservation;
}

export function listerReservations(): Reservation[] {
  return [...reservations];
}

export function obtenirReservationsParUtilisateur(
  utilisateurId: string
): Reservation[] {
  return reservations.filter((r) => r.utilisateurId === utilisateurId);
}

export function tauxRemplissage(evenementId: string): number {
  const evenement = trouverEvenementParId(evenementId);
  if (!evenement) throw new Error("Événement introuvable");
  const placesUtilisees =
    evenement.capaciteMaximale - evenement.placesDisponibles;
  if (evenement.capaciteMaximale === 0) return 0;
  return (placesUtilisees / evenement.capaciteMaximale) * 100; // pourcentage
}

export function nombreReservationsActives(): number {
  return reservations.filter((r) => r.statut === ReservationStatus.CONFIRMED)
    .length;
}

export function chiffreAffairesTotal(): number {
  return reservations
    .filter((r) => r.statut === ReservationStatus.CONFIRMED)
    .reduce((acc: number, r: Reservation) => {
      const evt = trouverEvenementParId(r.evenementId);
      const prixUnitaire = evt ? evt.prix : 0; // si l'événement n'existe plus, on considère 0
      return acc + prixUnitaire * r.nombrePlaces;
    }, 0);
}

function scriptDeDemonstration(): void {
  console.log("\n--- DÉMARRAGE DU SCRIPT DE DÉMONSTRATION ---");

  const alice = creerUtilisateur("Alice Dupont", "alice@example.com");
  const bob = creerUtilisateur("Bob Martin", "bob@example.com");
  console.log("Utilisateurs créés :", listerUtilisateurs());

  const concert = creerEvenement(
    "Soirée Rock",
    new Date("2025-12-10T20:00:00"),
    "Salle A",
    100,
    EventCategory.CONCERT,
    30
  );
  const conf = creerEvenement(
    "Conférence IA",
    new Date("2025-11-20T09:00:00"),
    "Centre de conférence",
    50,
    EventCategory.CONFERENCE,
    100
  );
  const atelier = creerEvenement(
    "Atelier TypeScript",
    new Date("2025-11-15T14:00:00"),
    "Salle B",
    20,
    EventCategory.WORKSHOP,
    25
  );
  console.log("\nÉvénements créés :", listerEvenements());

  console.log(
    "\nÉvénements - catégorie CONCERT :",
    filtrerEvenementsParCategorie(EventCategory.CONCERT)
  );

  console.log(
    '\nRecherche par nom "rock" :',
    rechercherEvenementParNom("rock")
  );

  const reservation1 = creerReservation(alice.id, concert.id, 2);
  console.log("\nRéservation confirmée pour Alice (2 places) :", reservation1);

  try {
    creerReservation(bob.id, atelier.id, 25);
  } catch (err) {
    console.log(
      "\nTentative de sur-réservation détectée :",
      (err as Error).message
    );
  }

  const reservation2 = creerReservation(bob.id, concert.id, 5);
  const reservation3 = creerReservation(alice.id, conf.id, 1);
  console.log(
    "\nToutes les réservations après créations :",
    listerReservations()
  );

  annulerReservation(reservation2.id);
  console.log(
    "\nAprès annulation de la réservation de Bob pour le concert :",
    listerReservations()
  );

  console.log(
    "\nPlaces disponibles pour le concert après annulation :",
    trouverEvenementParId(concert.id)?.placesDisponibles
  );

  creerReservation(bob.id, atelier.id, 20);
  console.log(
    "\nAtelier après réservation totale :",
    trouverEvenementParId(atelier.id)
  );

  try {
    creerReservation(alice.id, atelier.id, 1);
  } catch (err) {
    console.log(
      "\nErreur attendue — événement plein :",
      (err as Error).message
    );
  }

  console.log(
    "\nTaux de remplissage du concert :",
    tauxRemplissage(concert.id).toFixed(2) + "%"
  );
  console.log("Nombre de réservations actives :", nombreReservationsActives());
  console.log("Chiffre d'affaires total :", chiffreAffairesTotal(), "€");

  console.log(
    "\nRéservations d'Alice :",
    obtenirReservationsParUtilisateur(alice.id)
  );
  console.log("FINI =)");
}

if (require.main === module) {
  scriptDeDemonstration();
}

export { scriptDeDemonstration };
