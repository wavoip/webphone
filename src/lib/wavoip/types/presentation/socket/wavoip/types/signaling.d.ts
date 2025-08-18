import { AcceptContent } from './whatsapp/accept';
import { OfferContent } from './whatsapp/offer';
import { RejectContent } from './whatsapp/reject';
import { TerminateContent } from './whatsapp/terminate';
export type Signaling = OfferContent | AcceptContent | RejectContent | TerminateContent;
