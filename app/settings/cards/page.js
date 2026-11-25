"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import AddIcon from "@mui/icons-material/Add";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import { toast } from "react-toastify";
import GlowingBubbles from "@/components/GlowingBubbles";
import CardView from "@/components/CardView";
import { useCards } from "@/app/context/CardsContext";
import "./cards.css";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "credit", label: "Credit" },
  { key: "debit", label: "Debit" },
];

export default function CardsListPage() {
  const router = useRouter();
  const { cards, isLoaded, deleteCard } = useCards();

  const [filter, setFilter] = useState("all");
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [cardToDelete, setCardToDelete] = useState(null);

  const filteredCards = useMemo(() => {
    if (filter === "all") return cards;
    return cards.filter((c) => c.cardType === filter);
  }, [cards, filter]);

  const handleToggleExpand = (cardId) => {
    setExpandedCardId((prev) => (prev === cardId ? null : cardId));
  };

  const handleConfirmDelete = () => {
    if (!cardToDelete) return;
    deleteCard(cardToDelete.id);
    if (expandedCardId === cardToDelete.id) {
      setExpandedCardId(null);
    }
    toast.success("Card removed");
    setCardToDelete(null);
  };

  return (
    <div className="create-detail-page">
      <GlowingBubbles />
      <main className="cards-page-shell">
        <header className="cards-header">
          <div className="cards-header-left">
            <button
              type="button"
              className="cards-back-btn"
              onClick={() => router.push("/settings")}
              aria-label="Back to Settings"
            >
              <ArrowBackIosNewIcon sx={{ fontSize: 18 }} />
            </button>
            <div>
              <h1 className="cards-title">Credit &amp; Debit Cards</h1>
              <p className="cards-subtitle">
                {cards.length === 0
                  ? "Stored locally on this device"
                  : `${cards.length} saved ${cards.length === 1 ? "card" : "cards"} • Tap a card to expand`}
              </p>
            </div>
          </div>
        </header>

        {/* Filter Chips */}
        <div className="cards-filter-row" role="tablist" aria-label="Filter cards">
          {FILTERS.map((item) => {
            const isActive = filter === item.key;
            let activeClass = "";
            if (isActive) {
              activeClass =
                item.key === "credit"
                  ? "active-credit"
                  : item.key === "debit"
                    ? "active-debit"
                    : "active";
            }
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`cards-filter-chip ${activeClass}`}
                onClick={() => {
                  setFilter(item.key);
                  setExpandedCardId(null);
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Empty State */}
        {isLoaded && filteredCards.length === 0 ? (
          <div className="cards-empty-state">
            <div className="cards-empty-icon">
              <CreditCardOutlinedIcon sx={{ fontSize: 28 }} />
            </div>
            <h2 className="cards-empty-title">
              {filter === "all"
                ? "No cards saved yet"
                : `No ${filter} cards saved`}
            </h2>
            <p className="cards-empty-desc">
              Save your credit and debit cards securely in local storage for quick
              access anytime.
            </p>
            <button
              type="button"
              className="cards-empty-btn"
              onClick={() => router.push("/settings/cards/add")}
            >
              <AddIcon sx={{ fontSize: 18 }} />
              <span>Add Card</span>
            </button>
          </div>
        ) : (
          /* Apple Wallet Stacked Deck */
          <div className="wallet-deck">
            {filteredCards.map((card, index) => {
              const isExpanded = expandedCardId === card.id;
              const prevCard = index > 0 ? filteredCards[index - 1] : null;
              const isAfterExpanded =
                prevCard && expandedCardId === prevCard.id;

              let spacingClass = "";
              if (index > 0) {
                spacingClass = isAfterExpanded
                  ? "stacked-after-expanded"
                  : "stacked-overlap";
              }

              return (
                <div
                  key={card.id}
                  className={`wallet-deck-item ${spacingClass} ${
                    isExpanded ? "is-expanded" : ""
                  }`}
                  style={{ zIndex: index + 1 }}
                >
                  <CardView
                    card={card}
                    showActions={isExpanded}
                    onCardClick={() => handleToggleExpand(card.id)}
                    onEdit={(c) => router.push(`/settings/cards/edit/${c.id}`)}
                    onDelete={(c) => setCardToDelete(c)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      <button
        type="button"
        className="cards-fab"
        onClick={() => router.push("/settings/cards/add")}
        aria-label="Add new card"
      >
        <AddIcon sx={{ fontSize: 28 }} />
      </button>

      {/* Delete Confirmation Modal */}
      {cardToDelete && (
        <div
          className="cards-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-card-title"
          onClick={() => setCardToDelete(null)}
        >
          <div
            className="cards-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="delete-card-title" className="cards-modal-title">
              Delete Card?
            </h3>
            <p className="cards-modal-body">
              Remove <strong>{cardToDelete.bankName}</strong> ending in{" "}
              <strong>{String(cardToDelete.cardNumber).slice(-4)}</strong> from
              this device?
            </p>
            <div className="cards-modal-actions">
              <button
                type="button"
                className="cards-modal-cancel"
                onClick={() => setCardToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="cards-modal-delete"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
