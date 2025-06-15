const ModelMetrics = ({
  metrics,
}: {
  metrics?: {
    ks: string;
    accuracy: string;
    auroc: string;
    gini: string;
    ksChart: string;
    accuracyChart: string;
    aurocChart: string;
    giniChart: string;
  };
}) => {
  if (!metrics) {
    return null;
  }
  return (
    <div className="flex justify-start items-center">
      <div className="grid grid-cols-4">
        <div className="col-span-4">
          <h2 className="text-xl font-semibold mb-2">Model Metrics</h2>
        </div>
        <div className="col-span-1">
          <p className="text-sm font-medium py-2">
            KS: {(parseFloat(metrics.ks) * 100).toFixed(1)}%
          </p>
          <div className="flex">
            <img
              className="w-full h-auto"
              src={`data:image/png;base64,${metrics.ksChart}`}
              alt="KS Chart"
            />
          </div>
        </div>
        <div className="col-span-1">
          <p className="text-sm font-medium py-2">
            Accuracy: {(parseFloat(metrics.accuracy) * 100).toFixed(1)}%
          </p>
          <div className="flex">
            <img
              className="w-full h-auto"
              src={`data:image/png;base64,${metrics.accuracyChart}`}
              alt="KS Chart"
            />
          </div>
        </div>
        <div className="col-span-1">
          <p className="text-sm font-medium py-2">
            Gini: {(parseFloat(metrics.gini) * 100).toFixed(1)}%
          </p>
          <div className="flex">
            <img
              className="w-full h-auto"
              src={`data:image/png;base64,${metrics.giniChart}`}
              alt="KS Chart"
            />
          </div>
        </div>
        <div className="col-span-1">
          <p className="text-sm font-medium py-2">
            AUC-ROC: {(parseFloat(metrics.auroc) * 100).toFixed(1)}%
          </p>
          <div className="flex">
            <img
              className="w-full h-auto"
              src={`data:image/png;base64,${metrics.aurocChart}`}
              alt="KS Chart"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelMetrics;
