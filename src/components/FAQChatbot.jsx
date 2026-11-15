import { useEffect, useRef, useState } from "react";
import faqCategories from "../data/faqData";
import "./FAQChatbot.css";

function FAQChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const toggleButtonRef = useRef(null);

  function closePanel() {
    setIsOpen(false);
    toggleButtonRef.current?.focus();
  }

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        closePanel();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div className="faq-chatbot">
      {isOpen && (
        <section
          id="faq-chatbot-panel"
          className="faq-chatbot__panel"
          role="dialog"
          aria-labelledby="faq-chatbot-title"
          aria-modal="false"
        >
          <header className="faq-chatbot__header">
            <div className="faq-chatbot__identity">
              <span className="faq-chatbot__avatar" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M13.2 2.8 5.5 13h5.7l-.5 8.2L18.5 11h-5.8l.5-8.2Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <div>
                <h2 id="faq-chatbot-title">VoltSentry Assistant</h2>
                <p>Battery FAQs</p>
              </div>
            </div>
            <button
              className="faq-chatbot__close"
              type="button"
              onClick={closePanel}
              aria-label="Close VoltSentry Assistant"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </header>

          <div className="faq-chatbot__content" aria-live="polite">
            {selectedQuestion ? (
              <div className="faq-chatbot__conversation">
                <button
                  type="button"
                  className="faq-chatbot__back"
                  onClick={() => setSelectedQuestion(null)}
                >
                  <span aria-hidden="true">←</span> All questions
                </button>
                <p className="faq-chatbot__message faq-chatbot__message--question">
                  {selectedQuestion.question}
                </p>
                <p className="faq-chatbot__message faq-chatbot__message--answer">
                  {selectedQuestion.answer}
                </p>
              </div>
            ) : (
              <>
                <p className="faq-chatbot__welcome">
                  Hi! I can help with battery analysis, health and your
                  VoltSentry dashboard. Choose a question to get started.
                </p>
                <div className="faq-chatbot__questions">
                  {faqCategories.map((category) => (
                    <section
                      className="faq-chatbot__category"
                      key={category.name}
                      aria-labelledby={`faq-category-${category.name.replaceAll(" ", "-")}`}
                    >
                      <h3
                        id={`faq-category-${category.name.replaceAll(" ", "-")}`}
                      >
                        {category.name}
                      </h3>
                      <div className="faq-chatbot__question-list">
                        {category.questions.map((faq) => (
                          <button
                            className="faq-chatbot__question"
                            type="button"
                            key={faq.question}
                            onClick={() => setSelectedQuestion(faq)}
                          >
                            {faq.question}
                            <span aria-hidden="true">›</span>
                          </button>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      <button
        ref={toggleButtonRef}
        className="faq-chatbot__toggle"
        type="button"
        aria-label={isOpen ? "Close FAQ chat" : "Open FAQ chat"}
        aria-expanded={isOpen}
        aria-controls={isOpen ? "faq-chatbot-panel" : undefined}
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5 8 8 0 0 1-3.4-.8L4 20l1.5-4.1a7.4 7.4 0 0 1-1-3.9 7.5 7.5 0 1 1 15.5-.5Z" />
            <path d="M8 11h.01M12 11h.01M16 11h.01" />
          </svg>
        )}
      </button>
    </div>
  );
}

export default FAQChatbot;
