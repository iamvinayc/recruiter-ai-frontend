import { Check } from "lucide-react";

export const SuccessPage: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-blue-100">
            <div className="max-w-md w-full bg-white shadow-md rounded-lg p-6 text-center">
                <div className="rounded-full bg-green-600 p-2 w-16 mx-auto mb-4">
                    <Check className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Success!</h2>
                <p className="text-gray-600">Your request has been submitted, we will get back to you soon.</p>
                <button
                    className="mt-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-300"
                    onClick={() => window.location.href = 'https://www.talentpush.nl/'}
                >
                    Go to Home
                </button>
            </div>
        </div>
    );
}
