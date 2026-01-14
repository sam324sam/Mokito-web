export enum PetCondition {
  Tired = 'tired',        // energia < 30
  Exhausted = 'exhausted', // energia < 15
  Sad = 'sad',            // felicidad < 30
  Depressed = 'depressed', // felicidad < 15
  Hungry = 'hungry',      // hambre < 30
  Happy = 'happy',        // felicidad > 70
  Energetic = 'energetic', // energia > 70
}