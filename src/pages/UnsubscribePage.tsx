// TODO: Unsubscribe page
// import { useState, useEffect } from 'react';
// import { useSearchParams, useNavigate } from 'react-router-dom';
// import { useMutation } from '@tanstack/react-query';
// import { axiosApi } from '@/api/api';
// import { toast } from 'react-hot-toast';


// export const UnsubscribePage: React.FC = () => {
//     const [searchParams] = useSearchParams();
//     const navigate = useNavigate();
//     const [unsubscribed, setUnsubscribed] = useState(false);

//     const candidateId = searchParams.get('candidate');
//     const employerId = searchParams.get('employer');

//     const unsubscribeUrl = candidateId ? `/candidate/unsubscribe/`: `/employer/unsubscribe/`

//     const params = candidateId ? { candidate: candidateId } : { employer: employerId };

//     const mutation = useMutation(async () => {
//         const response = await axiosApi({
//           url: unsubscribeUrl,
//           method: 'GET',
//           params: params,
//         });
//         if (response.data.isSuccess) {
//           return response.data.data;
//         } else {
//           throw new Error(response.data.message);
//         }
//       });
    
//       const handleUnsubscribe = async () => {
//         try {
//           await mutation.mutateAsync();
//           setUnsubscribed(true);
//           toast.success('You have been successfully unsubscribed.');
//         } catch (error) {
//           toast.error('An error occurred while trying to unsubscribe. Please try again later.');
//         }
//       };
    
//       useEffect(() => {
//         if (!unsubscribeUrl) {
//           toast.error('Invalid unsubscribe link.');
//           navigate('/');
//         }
//       }, [unsubscribeUrl, navigate]);

//     return (
//         <div className="flex items-center justify-center min-h-screen bg-gray-100">
//             <div className="max-w-md w-full bg-white shadow-md rounded-lg p-6 text-center">
//                 <h2 className="text-2xl font-semibold text-gray-800 mb-4">Unsubscribe</h2>
//                 <p className="text-gray-600 mb-6">
//                     {unsubscribed
//                         ? 'You have been successfully unsubscribed from our mailing list.'
//                         : 'Are you sure you want to unsubscribe from our mailing list?'}
//                 </p>
//                 {!unsubscribed && (
//                     <button
//                         className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
//                         onClick={handleUnsubscribe}
//                     >
//                         Unsubscribe
//                     </button>
//                 )}
//             </div>
//         </div>
//     );
// }
