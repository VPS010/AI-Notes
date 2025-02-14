const ConfirmDialog = ({ isOpen, onConfirm, onCancel, message }) => {
    // Return nothing if the dialog isn't open
    if (!isOpen) return null;
  
    // Main component rendering the confirmation dialog
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
          <p className="text-gray-800 mb-6">{message}</p>
          <div className="flex justify-end gap-4">
            <button onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              Cancel
            </button>
            <button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default ConfirmDialog;
  