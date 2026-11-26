"use client";

import React, { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import AddIcon from "@mui/icons-material/Add";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import colors from "@/colors";
import { toast } from "react-toastify";
import GlowingBubbles from "@/components/GlowingBubbles";
import CardView from "@/components/CardView";
import { useCards } from "@/app/context/CardsContext";
import {
  downloadCardsBackup,
  parseCardsBackupJson,
} from "@/libs/cardsStorage";
import "./cards.css";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "credit", label: "Credit" },
  { key: "debit", label: "Debit" },
];

export default function CardsListPage() {
  const router = useRouter();
  const { cards, isLoaded, deleteCard, restoreCards } = useCards();
  const fileInputRef = useRef(null);

  const [filter, setFilter] = useState("all");
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [pendingImportCards, setPendingImportCards] = useState(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [backupMenuOpen, setBackupMenuOpen] = useState(false);

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

  const handleExportCards = () => {
    if (isTransferring) return;
    if (cards.length === 0) {
      toast.error("No cards to download");
      return;
    }
    try {
      setIsTransferring(true);
      const { fileName } = downloadCardsBackup(cards);
      toast.success(`Saved ${fileName}`);
    } catch (err) {
      toast.error(err?.message || "Failed to export cards");
    } finally {
      setIsTransferring(false);
    }
  };

  const handleImportFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || isTransferring) return;

    try {
      setIsTransferring(true);
      const text = await file.text();
      const parsed = parseCardsBackupJson(text);
      if (cards.length === 0) {
        restoreCards(parsed.cards, "replace");
        toast.success(`Imported ${parsed.cards.length} card(s)`);
      } else {
        setPendingImportCards(parsed.cards);
      }
    } catch (err) {
      toast.error(err?.message || "Failed to import cards JSON");
    } finally {
      setIsTransferring(false);
    }
  };

  const handleConfirmImport = (mode) => {
    if (!pendingImportCards) return;
    restoreCards(pendingImportCards, mode);
    if (mode === "replace") {
      setExpandedCardId(null);
      toast.success(`Replaced with ${pendingImportCards.length} card(s)`);
    } else {
      toast.success(`Merged ${pendingImportCards.length} card(s)`);
    }
    setPendingImportCards(null);
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

      {/* Hidden File Input for Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleImportFileChange}
        style={{ display: "none" }}
      />

      {/* Backup Menu Backdrop */}
      {backupMenuOpen && (
        <div
          className="cards-fab-backdrop"
          onClick={() => setBackupMenuOpen(false)}
        />
      )}

      {/* Secondary Backup FAB + Expandable Menu */}
      <div className="cards-backup-fab-container">
        {backupMenuOpen && (
          <div className="cards-backup-menu-list">
            <button
              type="button"
              className="cards-backup-menu-item"
              disabled={isTransferring}
              aria-label="Import cards JSON"
              onClick={() => {
                setBackupMenuOpen(false);
                fileInputRef.current?.click();
              }}
            >
              <span>Import</span>
              <FileUploadOutlinedIcon
                sx={{ fontSize: 18, color: colors.brand.primary }}
              />
            </button>

            <button
              type="button"
              className="cards-backup-menu-item"
              disabled={isTransferring}
              aria-label="Download cards JSON"
              onClick={() => {
                setBackupMenuOpen(false);
                handleExportCards();
              }}
            >
              <span>Download</span>
              <FileDownloadOutlinedIcon
                sx={{ fontSize: 18, color: colors.brand.primary }}
              />
            </button>
          </div>
        )}

        <button
          type="button"
          className="cards-backup-fab-btn"
          disabled={isTransferring}
          aria-label="Cards JSON backup options"
          onClick={() => setBackupMenuOpen((prev) => !prev)}
        >
          {backupMenuOpen ? (
            <CloseIcon sx={{ fontSize: 22 }} />
          ) : (
            <MoreVertIcon sx={{ fontSize: 22 }} />
          )}
        </button>
      </div>

      {/* Floating Add Button */}
      <button
        type="button"
        className="cards-fab"
        onClick={() => {
          setBackupMenuOpen(false);
          router.push("/settings/cards/add");
        }}
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
      {/* Import Cards Merge/Replace Modal */}
      {pendingImportCards && (
        <div
          className="cards-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-cards-title"
          onClick={() => setPendingImportCards(null)}
        >
          <div
            className="cards-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="import-cards-title" className="cards-modal-title">
              Import {pendingImportCards.length} Card(s)
            </h3>
            <p className="cards-modal-body">
              You already have {cards.length} saved card(s). Would you like to
              merge new cards or replace your existing list?
            </p>
            <div className="cards-modal-actions">
              <button
                type="button"
                className="cards-modal-cancel-flex"
                onClick={() => setPendingImportCards(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="cards-modal-replace-outline"
                onClick={() => handleConfirmImport("replace")}
              >
                Replace
              </button>
              <button
                type="button"
                className="cards-modal-merge-fill"
                onClick={() => handleConfirmImport("merge")}
              >
                Merge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
