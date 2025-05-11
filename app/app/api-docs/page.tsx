"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// Importação dinâmica do Swagger UI para evitar problemas de renderização no servidor
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });
import "swagger-ui-react/swagger-ui.css";

export default function ApiDocsPage() {
  const [activeTab, setActiveTab] = useState<string>("swagger");
  const [postmanContent, setPostmanContent] = useState<string>("");

  useEffect(() => {
    // Carregar o conteúdo do arquivo postman.json
    if (activeTab === "postman") {
      fetch("/postman.json")
        .then((response) => response.json())
        .then((data) => {
          setPostmanContent(JSON.stringify(data, null, 2));
        })
        .catch((error) => {
          console.error("Erro ao carregar o Postman JSON:", error);
        });
    }
  }, [activeTab]);

  const handleDownloadPostman = () => {
    // Criar um elemento de link para download
    const element = document.createElement("a");
    const file = new Blob([postmanContent], { type: "application/json" });
    element.href = URL.createObjectURL(file);
    element.download = "postman_collection.json";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Documentação da API</h1>
      
      <Tabs defaultValue="swagger" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="swagger">Swagger/OpenAPI</TabsTrigger>
          <TabsTrigger value="postman">Postman Collection</TabsTrigger>
        </TabsList>
        
        <TabsContent value="swagger" className="mt-4">
          <div className="bg-white dark:bg-gray-800 rounded-md p-4">
            <SwaggerUI url="/swagger.yaml" />
          </div>
        </TabsContent>
        
        <TabsContent value="postman" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button onClick={handleDownloadPostman}>
              Baixar Postman Collection
            </Button>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4 overflow-auto max-h-screen">
            <pre>{postmanContent}</pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 