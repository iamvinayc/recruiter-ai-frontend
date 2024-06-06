import { axiosApi } from "@/api/api";
// import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/common/Button";
import { ROUTES } from "@/routes/routes";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTypedSearchParams } from "react-router-typesafe-routes/dom";
// const AGREEMENT_URL =
//   "https://recruiter-ai.s3.eu-central-1.amazonaws.com/agreements/employer.pdf";

export default function EmployerAgreementPage() {
  const [isChecked, setIsChecked] = useState(false);
  const [message, setMessage] = useState('');
  const [{ employer }] = useTypedSearchParams(ROUTES.EMPLOYER.AGREEMENT);
  const navigate = useNavigate();

  // const [file, setFile] = useState<File | null>(null);
  const fileUploadMutation = useMutation({
    mutationKey: ["fileUploadMutation", employer],
    mutationFn: async () => {
      // if (!file) {
      //   toast.error("Please select the signed agreement");
      //   return false;
      // }
      // const data = new FormData();
      // data.append("agreement", file);
      return axiosApi({
        method: "POST",
        url: "data-sourcing/employer/show_interest/",
        params: {
          employer,
        },
        // data,
      })
        .then((e) => e.data)
        .then((e) => {
          if (e.isSuccess) {
            toast.success("Terms and Conditions Accepted");
            navigate("/");
            return true;
          } else {
            toast.error(e.message || "Some error ocurred");
            return false;
          }
        })
        .catch(() => {
          toast.success("Terms and Conditions Accepted");
          return false;
        });
    },
  });
  const onSubmit = () => {
    if (!isChecked) {
      setMessage('Please agree to the terms and conditions to proceed.');
      return;
    }
    fileUploadMutation.mutateAsync();
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-100">
      <div className="bg-[url('/watermark.jpg')] bg-contain bg-no-repeat bg-center bg-white w-full max-w-2xl rounded-md p-8 shadow-lg">
        <div className="mb-3">
        {/* <img className="h-[50px] mx-auto" src="/logo.svg" /> */}
          <p className="mb-4 text-lg font-bold uppercase">
            VOORWAARDEN SAMENWERWERKING
          </p>
          <p className="mb-4 text-base font-medium">
            Client en Recruitmentbureau erkennen de potentiële voordelen van een 
            samenwerking op het gebied van recruitment. Beide partijen wensen hun intentie 
            tot samenwerking  vast te leggen.
          </p>
          <p className="text-base mb-2">
            1. De partijen streven naar een samenwerking waarbij Recruitmentbureau Klant 
            ondersteunt bij het werven en selecteren van geschikte kandidaten voor 
            openstaande posities binnen de organisatie van Klant.
          </p>
          <p className="text-base mb-2">
            2. Recruitmentbureau zal:
          </p>
          <p className="text-base mb-1">
            A Proactief op zoek gaan naar geschikte kandidaten voor de door Klant 
            opgegeven functies.
            B Een grondige screening en voorselectie van kandidaten uitvoeren.
            C Kandidaten voorstellen aan Klant die mogelijk voldoen aan de gespecificeerde 
            functie-eisen.
          </p> 
          <p className="text-base mb-2">
            3. Klant zal:
          </p>
          <p className="text-base mb-1">
            A Recruitmentbureau voorzien van gedetailleerde informatie over de openstaande
            functies en de vereisten voor kandidaten.
            B Tijdig feedback geven op de voorgestelde kandidaten.
            C Recruitmentbureau op de hoogte houden van wijzigingen in de functie-eisen of 
            andere relevante informatie.
          </p>
          <p className="text-base mb-2">
            4.  Beide partijen zullen alle vertrouwelijke informatie die zij van elkaar 
            ontvangen strikt vertrouwelijk behandelen en niet aan derden bekendmaken 
            zonder voorafgaande schriftelijke toestemming van de andere partij.
          </p>
          <p className="text-base mb-2">
            4.1 Klant en/of medewerker(s) of gelieerde onderneming(en) en/of haar 
            medewerkers zullen geen door Recruitmentbureau voorgestelde kandidaten 
            benaderen zonder medeweten van Recruitmentbureau voor een periode van 12 
            maanden na introductie van de kandidaat.
          </p>
          <p className="text-base mb-2">
            5. Deze intentieverklaring is niet bindend en verplicht geen van beide partijen tot 
            het aangaan van een definitieve samenwerkingsovereenkomst. Deze 
            intentieverklaring dient slechts als basis voor verdere onderhandelingen.
          </p>
          <p className="text-base mb-2">
            6. Deze intentieverklaring treedt in werking op de datum van aanvaarding door 
            klant en blijft van kracht totdat deze wordt vervangen door een definitieve 
            samenwerkingsovereenkomst of totdat een van beide partijen schriftelijk 
            aangeeft geen verdere stappen te willen ondernemen.
          </p>
        </div>
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => setIsChecked(!isChecked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="ml-2 text-gray-700">I agree with terms and conditions and privacy statement</span>
          </label>
        </div>
        {message && (
          <div className="mb-4 text-red-500">
            {message}
          </div>
        )}
        <div>
          <Button onClick={onSubmit} isLoading={fileUploadMutation.isPending} className="py-2">
            Accept conditions of cooperation 
          </Button>
        </div>
      </div>
    </div>
  );

  // return (
  //   <div className="flex min-h-screen items-center justify-center bg-blue-100">
  //     <div className="bg-gray-100 w-full max-w-2xl rounded-md bg-gray p-8 shadow-lg">
  //       <div className="space-y-3">
  //         <div className=" text-xl font-bold">Download agreement:</div>
  //         <div>
  //           <a href={AGREEMENT_URL} target="_blank" rel="noreferrer">
  //             <Button className="py-2">Download</Button>
  //           </a>
  //         </div>
  //         <div className=" text-xl font-bold">Upload Signed agreement:</div>
  //         <FileUpload file={file} setFile={setFile} isLoading={false} />
  //         <div onClick={onSubmit} className="flex justify-end">
  //           <Button isLoading={fileUploadMutation.isPending} className="py-2">
  //             Upload
  //           </Button>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );

}
