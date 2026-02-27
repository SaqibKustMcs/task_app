import { Document } from 'mongoose';

export interface PostOption {
  id: string;
  text: string;
  votes: string[]; // Array of user IDs who voted for this option
}

export interface Post extends Document {
  id: string;
  userId: string;
  villageId: string;
  type: 'text' | 'image' | 'video' | 'question';
  text: string;
  mediaUrl: string;
  mediaType: 'image' | 'video' | null;
  question: string;
  options: PostOption[];
  totalVotes: number;
  likedBy: string[];
  likesCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}