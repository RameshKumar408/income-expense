"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  detectCardNetwork,
  loadSavedCards,
  sanitizeCardNumber,
  saveCardsToStorage,
} from "@/libs/cardsStorage";

const CardsContext =
  globalThis.__CARDS_CONTEXT__ ||
  (globalThis.__CARDS_CONTEXT__ = createContext(null));

function useCardsStore(enabled = true) {
  const [cards, setCards] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    setCards(loadSavedCards());
    setIsLoaded(true);

    const handleStorage = (e) => {
      if (e.key === "savedCards") {
        setCards(loadSavedCards());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [enabled]);

  const persist = useCallback(
    (updater) => {
      if (!enabled) return;
      setCards((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        saveCardsToStorage(next);
        return next;
      });
    },
    [enabled],
  );

  const addCard = useCallback(
    (input) => {
      const cleanNumber = sanitizeCardNumber(input.cardNumber);
      const newCard = {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `card_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        cardType: input.cardType === "debit" ? "debit" : "credit",
        bankName: String(input.bankName || "").trim(),
        cardHolderName: String(input.cardHolderName || "").trim(),
        cardNumber: cleanNumber,
        expiry: String(input.expiry || "").trim(),
        cvv: String(input.cvv || "").replace(/\D/g, "").slice(0, 4),
        network: detectCardNetwork(cleanNumber),
        createdAt: new Date().toISOString(),
      };
      persist((prev) => [newCard, ...prev]);
      return newCard;
    },
    [persist],
  );

  const updateCard = useCallback(
    (id, updates) => {
      const cleanNumber = sanitizeCardNumber(updates.cardNumber);
      persist((prev) =>
        prev.map((card) => {
          if (card.id !== id) return card;
          return {
            ...card,
            cardType: updates.cardType === "debit" ? "debit" : "credit",
            bankName: String(updates.bankName || "").trim(),
            cardHolderName: String(updates.cardHolderName || "").trim(),
            cardNumber: cleanNumber,
            expiry: String(updates.expiry || "").trim(),
            cvv: String(updates.cvv || "").replace(/\D/g, "").slice(0, 4),
            network: detectCardNetwork(cleanNumber),
          };
        }),
      );
    },
    [persist],
  );

  const deleteCard = useCallback(
    (id) => {
      persist((prev) => prev.filter((card) => card.id !== id));
    },
    [persist],
  );

  const getCardById = useCallback(
    (id) => cards.find((card) => card.id === id) || null,
    [cards],
  );

  const restoreCards = useCallback(
    (incomingCards, mode = "merge") => {
      if (!Array.isArray(incomingCards)) return { added: 0, total: cards.length };
      if (mode === "replace") {
        persist(incomingCards);
        return { added: incomingCards.length, total: incomingCards.length };
      }

      let addedCount = 0;
      persist((prev) => {
        const existingIds = new Set(prev.map((c) => c.id));
        const existingFingerprints = new Set(
          prev.map((c) => `${c.cardNumber}_${c.expiry}`),
        );
        const toAdd = incomingCards.filter((c) => {
          const fp = `${c.cardNumber}_${c.expiry}`;
          if (existingIds.has(c.id) || existingFingerprints.has(fp)) {
            return false;
          }
          existingIds.add(c.id);
          existingFingerprints.add(fp);
          return true;
        });
        addedCount = toAdd.length;
        return [...toAdd, ...prev];
      });
      return { added: addedCount, total: cards.length + addedCount };
    },
    [persist, cards.length],
  );

  return {
    cards,
    isLoaded,
    addCard,
    updateCard,
    deleteCard,
    getCardById,
    restoreCards,
  };
}

export function CardsProvider({ children }) {
  const value = useCardsStore(true);

  return (
    <CardsContext.Provider value={value}>{children}</CardsContext.Provider>
  );
}

export function useCards() {
  const ctx = useContext(CardsContext);
  const fallback = useCardsStore(!ctx);
  return ctx || fallback;
}
