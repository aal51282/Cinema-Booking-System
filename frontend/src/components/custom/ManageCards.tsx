// ManageCards.tsx

import { CardInformation } from "@/util/types";
import { useAuth } from "./AuthContext";
import { useEffect, useState } from "react";
import CardEditor from "./CardEditor";
import { TabsContent } from "@radix-ui/react-tabs";
import { CreditCard } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { Button } from "../ui/button";

export default function ManageCards() {
  const { fetchPaymentMethods, addCard, updateCard, deleteCard } = useAuth();
  const [cardList, setCardList] = useState<CardInformation[]>([]);
  const [newCard, setNewCard] = useState<CardInformation | null>(null);
  const [editedCards, setEditedCards] = useState<CardInformation[]>([]);

  const handleNewCard = async () => {
    if (newCard) {
      try {
        if (newCard.cardNumber !== "") {
          await addCard(newCard);
          await getPaymentMethods();
          setNewCard(null);
        }
      } catch (error:any) {
        alert(`Error adding card: ${error.response.data.message}`);
      }
    } else {
      setNewCard({
        card_id: null,
        cardType: 'Visa',
        cardNumber: '',
        cardHolderName: '',
        expirationDate: '',
        cvv: '',
        isDefault: false,
        billingAddress: null
      });
    }
  };

  const handleCardChange = (updatedCard: CardInformation) => {
    setCardList((prevCards) =>
      prevCards.map((card) =>
        card.card_id === updatedCard.card_id ? updatedCard : card
      )
    );

    setEditedCards((prevEditedCards) => {
      const isAlreadyEdited = prevEditedCards.some(
        (card) => card.card_id === updatedCard.card_id
      );
      if (!isAlreadyEdited) {
        return [...prevEditedCards, updatedCard];
      } else {
        return prevEditedCards.map((card) =>
          card.card_id === updatedCard.card_id ? updatedCard : card
        );
      }
    });
  };
  
  const getPaymentMethods = async () => {
    const cards = await fetchPaymentMethods();
    console.log(cards);
    if (cards) setCardList(cards);
  };

  const handleSaveChanges = async () => {
    const updatePromises = editedCards.map((card) => {
      console.log(card);
      card.card_id ? updateCard(card.card_id, card) : null
    });
    await Promise.all(updatePromises);
    getPaymentMethods()
    
    setEditedCards([]);
  };

  useEffect(() => {
    getPaymentMethods();
  }, []);

  return (
    <TabsContent value="payment">
      <Card className="bg-darkgray-800 border-darkgray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white flex items-center">
            <CreditCard className="mr-2" /> Payment Methods
            {cardList.length < 3 && <Button
              variant="outline"
              className="ml-4"
              onClick={() => handleNewCard()}
            >
              {newCard ? "Save New Card" : "New Card"}
            </Button>}
            {editedCards.length > 0 && (
              <Button
                variant="outline"
                className="ml-4"
                onClick={() => handleSaveChanges()}
              >
                Save Changes
              </Button>
            )}
          </CardTitle>
          <CardDescription className="text-darkgray-300">
            Manage your payment methods (up to 3)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-white flex flex-col gap-4">
            {newCard && (
              <CardEditor
                cardData={newCard}
                onChange={(card) => {
                  setNewCard(card)
                }}
              />
            )}
            {cardList.map((card) => (
              <CardEditor
                key={card.card_id}
                cardData={card}
                onChange={(updatedCard) => handleCardChange(updatedCard)}
                onDelete={(card.card_id && cardList.length > 1) ? (async () => {
                  await deleteCard(card.card_id!);
                  getPaymentMethods();
                }):undefined}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
