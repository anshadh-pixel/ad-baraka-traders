import html2canvas from 'html2canvas';

/**
 * Converts a DOM element into a PNG Image Data URL or Blob
 */
export const generateBillImage = async (elementId) => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  // Generate canvas with 2x scale for sharp high-DPI retina display
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const dataUrl = canvas.toDataURL('image/png');
      resolve({ blob, dataUrl });
    }, 'image/png', 1.0);
  });
};

/**
 * Shares an image file via native Web Share API (WhatsApp contact picker)
 */
export const shareBillPhoto = async ({ blob, fileName = 'bill-invoice.png', text = '' }) => {
  if (navigator.share && navigator.canShare && blob) {
    try {
      const file = new File([blob], fileName, { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Invoice / Bill',
          text: text,
        });
        return true;
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing file:', err);
      }
    }
  }
  return false;
};

/**
 * Downloads image directly to phone gallery / computer
 */
export const downloadBillPhoto = (dataUrl, fileName = 'bill-invoice.png') => {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
