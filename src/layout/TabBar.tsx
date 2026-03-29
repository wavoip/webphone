// import { Users } from "lucide-react";

import { Clock, DotsNine, Users } from "@phosphor-icons/react";
import { Voicemail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
// import { Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WebPhone } from "@/components/WebPhone";
import { LoginScreen } from "@/screens/LoginScreen";

export default function TabBar() {
    return (
        <Tabs defaultValue="keyboard" orientation="vertical" className="wv:flex wv:flex-row wv:h-full wv:gap-0 ">
            {/* Coluna 1: A lista de abas */}
            <TabsList className="wv:text-muted-foreground wv:w-fit wv:items-center wv:justify-start wv:rounded-lg wv:desktop:rounded-none wv:flex wv:flex-col wv:h-full wv:bg-surface wv:p-2">
                <div>
                    <TabsTrigger value="team" className="wv:flex wv:w-full wv:h-[35px] wv:max-sm:h-[32px] wv:max-sm:w-[32px] wv:max-sm:[&_svg:not([class*=size-])]:size-4">
                        <Users size={32} />
                    </TabsTrigger>
                </div>
                <div>
                    <TabsTrigger value="keyboard" className="wv:flex wv:w-full wv:h-[35px] wv:max-sm:h-[32px] wv:max-sm:w-[32px] wv:max-sm:[&_svg:not([class*=size-])]:size-4">
                        <DotsNine size={32} />
                    </TabsTrigger>
                </div>
                <div>
                    <TabsTrigger value="history" className="wv:w-full wv:h-[35px] wv:max-sm:h-[32px] wv:max-sm:w-[32px] wv:max-sm:[&_svg:not([class*=size-])]:size-4">
                        <Clock size={32} />
                    </TabsTrigger>
                </div>
                <div>
                    <TabsTrigger value="missed" className="wv:w-full wv:h-[35px] wv:max-sm:h-[32px] wv:max-sm:w-[32px] wv:max-sm:[&_svg:not([class*=size-])]:size-4">
                        <Voicemail size={32} />
                    </TabsTrigger>
                </div>

                <Separator className="wv:m-2" />
                <div>
                    <Avatar className="wv:size-6 wv:rounded-full wv:max-sm:size-8 ">
                        <AvatarImage src="https://github.com/shadcn.png" alt="@evilrabbit" />
                        <AvatarFallback>ER</AvatarFallback>
                    </Avatar>
                </div>
            </TabsList>

            {/* Coluna 2: O conteúdo */}
            <div className="wv:bg-background wv:rounded-md wv:w-full wv:border-1 wv:border-muted-200 wv:desktop:rounded-tr-none wv:desktop:rounded-br-none">
                <TabsContent value="keyboard" className="wv:flex wv:flex-col wv:mt-0 wv:h-full">
                    <WebPhone />
                </TabsContent>
                <TabsContent value="contacts" className="wv:mt-0">
                    Configurações de Segurança
                </TabsContent>
            </div>
        </Tabs>
    );
}
