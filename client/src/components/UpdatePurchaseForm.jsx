import React, { useState, useEffect } from "react";
import Select from "react-select";
import { TrashIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import {
  CardBody,
  Input,
  Card,
  CardHeader,
  Typography,
  Button,
  CardFooter,
  Tooltip,
  IconButton,
} from "@material-tailwind/react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { apiRoutes } from "../utils/apiRoutes";
import { SyncLoadingScreen } from "./UI/LoadingScreen";
import Layout from "../layouts/PageLayout";

export default function UpdatePurchaseForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    purchaseDate: "",
    invoiceNo: "",
    purchaseDetails: "",
    supplier: null, // This will hold the selected supplier
  });

  const [dataArray, setDataArray] = useState([
    { medicine: "", batchNo: "", mfgDate: "", expDate: "", quantity: "" },
  ]);
  const [netQty, setNetQty] = useState(0);
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);

  useEffect(
    () => async () => {
      // Fetch suppliers list when the component mounts
      setLoading(true);
      await fetchSuppliers();
      await fetchMedicines();
      await fetchPurchaseData();
      setLoading(false);
    },
    []
  );

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(apiRoutes.supplier, {
        withCredentials: true,
      });
      // console.log(response.data);
      setSuppliers(response.data.data); // Assuming the response is an array of suppliers
    } catch (error) {
      console.error(
        `ERROR (fetch-supplier-in-add-purchase): ${error?.response?.data?.message}`
      );
      toast.error(
        error?.response?.data?.message || "Failed to fetch Suppliers"
      );
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await axios.get(apiRoutes.medicine, {
        withCredentials: true,
      });
      // console.log(response.data);
      setMedicines(response.data.data); // Assuming the response is an array of medicines
    } catch (error) {
      console.error(
        `ERROR (fetch-medicines-in-add-purchase): ${error?.response?.data?.message}`
      );
      toast.error(
        error?.response?.data?.message || "Failed to fetch Medicines"
      );
    }
  };

  const fetchPurchaseData = async () => {
    try {
      const response = await axios.get(`${apiRoutes.purchase}/${id}`, {
        withCredentials: true,
      });
      const resData = response.data;
      const purchaseData = resData.data;
      console.log(purchaseData);
      setFormData({
        purchaseDate: purchaseData.purchaseDate,
        invoiceNo: purchaseData.invoiceNo,
        purchaseDetails: purchaseData.details,
        supplier: {
          label: purchaseData.supplierName,
          value: purchaseData.supplierId,
        },
      });
      setDataArray(
        purchaseData.medicines.map((medicine) => ({
          medicine: {
            label: medicine.name,
            value: medicine.medicineId,
          },
          batchNo: medicine.batchNo,
          mfgDate: medicine.mfgDate,
          expDate: medicine.expDate,
          quantity: medicine.totalQuantity,
        }))
      );
      console.log(dataArray);
      // handleNetQtyChange();
    } catch (error) {
      console.error(
        `ERROR (fetch-purchase-data-in-update-purchase): ${error?.response?.data?.message}`
      );
      toast.error(
        error?.response?.data?.message || "Failed to fetch Purchase Data"
      );
    }
  };
  // const handleNetQtyChange = () => {
  //   let curNetQty = 0;
  //   dataArray.map((data) => {
  //     curNetQty = curNetQty + (parseInt(data["quantity"]) || 0);
  //   });
  //   setNetQty(curNetQty);
  // };

  const handleInputChange = (key, index, value) => {
    // console.log(dataArray)
    console.log(key, index, value);
    const updatedArray = [...dataArray];
    console.log(updatedArray);
    updatedArray[index][key] = value;
    setDataArray(updatedArray);
    // if (key == "quantity") {
    //   handleNetQtyChange();
    // }
  };
  const handleDeleteRow = (index) => {
    console.log(index);
    if (dataArray.length == 1) {
      // Prevent deleting the first row
      toast.error("Purchase must have at least one item");
      return;
    }
    //**** GIVE ERROR MSG HERE
    const updatedArray = [...dataArray];
    updatedArray.splice(index, 1);
    console.log(updatedArray);
    setDataArray(updatedArray);
    setNetQty(
      (prevQty) => prevQty - (parseInt(dataArray[index]["quantity"]) || 0)
    );
  };

  const handleAddRow = () => {
    setDataArray([
      ...dataArray,
      { medicine: "", batchNo: "", mfgDate: "", expDate: "", quantity: "" },
    ]);
  };

  const handleChange = (name, value) => {
    // console.log(e.target);
    // const { name, value } = e.target;
    // console.log(name, value);
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleSupplierChange = (selectedSupplier) => {
    console.log(selectedSupplier);
    setFormData((prevData) => ({
      ...prevData,
      supplier: selectedSupplier,
    }));
  };

  const handleMedicineChange = (selectedMedicine, index) => {
    console.log(selectedMedicine.value);
    setDataArray((prevData) => {
      const updatedArray = [...prevData];
      updatedArray[index].medicine = selectedMedicine;
      console.log(updatedArray);
      return updatedArray;
    });
  };
  //this is required for handling TypeError: Don't know how to serialize BigInt
  BigInt.prototype.toJSON = function () {
    return this.toString();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    /* ALSO CLEAR THE PURCHASE LIST DATA ON SUBMITTING THE FORM ****** */

    const purchaseListEntry = {
      purchaseDate: formData.purchaseDate,
      invoiceNo: BigInt(formData.invoiceNo) || 0,
      supplierId: formData?.supplier?.value, // Assuming supplier object has a unique identifier 'value'  //will be passing supplier id to backend
    };
    if (formData.purchaseDetails)
      purchaseListEntry.purchaseDetails = formData.purchaseDetails; //optional
    
    const purchaseItems = dataArray.map((data) => {
      const purchaseItem = {
        medicineId: data.medicine.value, // Assuming medicine object has a unique identifier 'value'  //will be passing medicine id to backend
        batchNo: BigInt(data.batchNo) || 0,
        expiryDate: data.expDate,
        quantity: parseInt(data.quantity) || 0, // Assuming quantity is a number
      };
      if (data.mfgDate) purchaseItem.mfgDate = data.mfgDate ; //optional
      return purchaseItem;
    });

    // Here you can handle the submission of the form
    const data = { ...purchaseListEntry, purchaseItems };
    console.log(data);
    //***DON'T LET THE FORM SUBMIT IF ANY OF MANDATORY ITEMS IS MISSING OR ANY LIST ROW FIELD IS EMPTY */
    setLoading(true);
    try {
      const response = await axios.put(`${apiRoutes.purchase}/${id}`, data, {
        withCredentials: true
      });
      console.log(response.data);
      toast.success(response.data.message);
      setTimeout(() => {
        navigate("/purchase");
      }, 1000);
    }
    catch (error) {
      console.error(
        `ERROR (update-purchase): ${error?.response?.data?.message}`
      );
      toast.error(error?.response?.data?.message || "Failed to update Purchase");
    }
    setLoading(false);
  };

  const TABLE_HEAD = [
    "Medicine Name",
    "Batch No.",
    "Mfg. Date",
    "Exp. Date",
    "Total Quantity",
  ];

  return (
    <>
      {loading && <SyncLoadingScreen />}
      {!loading && (
        <Layout>
          <Card className="h-max w-full">
            <CardHeader
              floated={false}
              shadow={false}
              className="rounded-none pb-3"
            >
              <div className="mb-2 sm:flex sm:flex-row flex-col items-center justify-between gap-8">
                <div>
                  <div className="flex flex-row items-center justify-between gap-8">
                    <Typography variant="h5" color="blue-gray">
                      Purchase Form
                    </Typography>
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:hidden">
                      <Button
                        className="flex items-center gap-3"
                        size="md"
                        onClick={() => {
                          navigate("/purchase");
                        }}
                      >
                        Purchase List
                      </Button>
                    </div>
                  </div>
                  <Typography color="gray" className="mt-1 font-normal">
                    Update the Purchase.
                  </Typography>
                </div>
                <div className="hidden sm:flex shrink-0 flex-col gap-2 sm:flex-row">
                  <Button
                    className="flex items-center gap-3"
                    size="md"
                    onClick={() => {
                      navigate("/purchase");
                    }}
                  >
                    Purchase List
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody className="p-3 sm:p-6">
              <form onSubmit={handleSubmit} className="flex flex-wrap gap-6">
                <div className="grid  sm:grid-cols-2 gap-y-8 gap-x-4 w-full">
                  <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                    <div className="flex mr-2 md:w-72 w-full justify-end">
                      <label htmlFor="invoiceNo">
                        Invoice No. <span className="text-red-800">*</span>:
                      </label>
                    </div>
                    <Input
                      id="invoiceNo"
                      type="number"
                      min={1}
                      size="md"
                      label="Invoice No."
                      name="invoiceNo"
                      value={formData.invoiceNo}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                    <div className="flex mr-4 md:w-72 w-full justify-end">
                      <label htmlFor="purchaseDate">
                        Purchase Date <span className="text-red-800">*</span>:
                      </label>
                    </div>
                    <Input
                      id="purchaseDate"
                      size="md"
                      label="Purchase Date"
                      className="w-full"
                      name="purchaseDate"
                      type="date"
                      value={formData.purchaseDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                    <div className="flex mr-2 md:w-72 w-full justify-end">
                      <label htmlFor="supplier">
                        Supplier <span className="text-red-800">*</span>:
                      </label>
                    </div>
                    <Select
                      id="supplier"
                      options={suppliers.map((supplier) => ({
                        value: supplier.id, // Assuming supplier object has a unique identifier 'id'
                        label: supplier.name, // Assuming supplier object has a property 'name'
                      }))}
                      value={formData.supplier}
                      onChange={handleSupplierChange}
                      isClearable={true}
                      placeholder="Select Supplier"
                      className="w-full"
                    />
                  </div>

                  <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                    <div className="flex mr-2 md:w-72 w-full justify-end">
                      <label htmlFor="purchaseDetails">Details:</label>
                    </div>
                    <Input
                      id="purchaseDetails"
                      size="md"
                      label="Details"
                      name="purchaseDetails"
                      value={formData.purchaseDetails}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </form>
              <table className="overflow-scroll mt-12 w-full table-auto text-left">
                <thead>
                  <tr>
                    {TABLE_HEAD.map((head) => (
                      <th
                        key={head}
                        className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                      >
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal leading-none opacity-70"
                        >
                          {head}
                          {head != "Mfg. Date" && (
                            <span className="text-red-900"> *</span>
                          )}
                        </Typography>
                      </th>
                    ))}
                    <th className="p-2 border-y border-blue-gray-100 bg-blue-gray-50/50">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal leading-none opacity-70"
                      >
                        Action
                      </Typography>
                    </th>
                  </tr>
                </thead>
                <tbody>
            {dataArray.map((data, index) => (
              <tr key={index}>
                <td key="medicine" className="p-4 border-b border-blue-gray-50">
                  <div className="flex items-center gap-3">
                    <Select
                      options={medicines.map((medicine) => ({
                        value: medicine.id, // Assuming medicine object has a unique identifier 'id'
                        label: medicine.brandName, // Assuming medicine object has a property 'brandName'
                      }))}
                      value={data["medicine"]}
                      onChange={(selectedMedicine) =>
                        handleMedicineChange(selectedMedicine, index)
                      }
                      isClearable={true}
                      placeholder="Select Medicine"
                      className="w-full"
                    />
                  </div>
                </td>
                <td key="batchNo" className="p-4 border-b border-blue-gray-50">
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min={1}
                      value={data["batchNo"]}
                      onChange={(e) =>
                        handleInputChange("batchNo", index, e.target.value)
                      }
                    />
                  </div>
                </td>
                <td key="mfgDate" className="p-4 border-b border-blue-gray-50">
                  <div className="flex items-center gap-3">
                    <Input
                      type="date"
                      value={data["mfgDate"]}
                      onChange={(e) =>
                        handleInputChange("mfgDate", index, e.target.value)
                      }
                    />
                  </div>
                </td>
                <td key="expDate" className="p-4 border-b border-blue-gray-50">
                  <div className="flex items-center gap-3">
                    <Input
                      type="date"
                      value={data["expDate"]}
                      onChange={(e) =>
                        handleInputChange("expDate", index, e.target.value)
                      }
                    />
                  </div>
                </td>
                <td key="quantity" className="p-4 border-b border-blue-gray-50">
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min={1}
                      value={data["quantity"]}
                      onChange={(e) =>
                        handleInputChange("quantity", index, e.target.value)
                      }
                    />
                  </div>
                </td>

                <td className="p-2 border-b border-blue-gray-50">
                  <Tooltip content="Delete">
                    <IconButton
                      variant="text"
                      onClick={() => {
                        handleDeleteRow(index);
                      }}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </IconButton>
                  </Tooltip>
                </td>
              </tr>
            ))}
            <tr>
                  <td colSpan="6" className="p-4">
                    <div className="flex justify-center items-center gap-2">
                      <Tooltip content="Add">
                        <IconButton variant="text" onClick={handleAddRow}>
                          <PlusCircleIcon className="h-5 w-5" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </td>
                </tr> 
            {/* last row */}
            {/* <tr>
              <td className="p-4 border-b border-blue-gray-50"></td>

              <td className="p-4 border-b border-blue-gray-50"></td>
              <td className="p-4 border-b border-blue-gray-50"></td>
              <td className="p-4 border-b border-blue-gray-50">
                <div className="flex justify-end items-center gap-3">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-bold text-right"
                  >
                    Net Quantity :
                  </Typography>
                </div>
              </td>
              <td className="p-4 border-b border-blue-gray-50">
                <div className="flex justify-center items-center gap-3">
                  <Typography
                    variant="medium"
                    color="blue-gray"
                    className="font-bold"
                  >
                    {netQty}
                  </Typography>
                </div>
              </td>
              <td className="p-2 border-b border-blue-gray-50">
                <Tooltip content="Add">
                  <IconButton variant="text" onClick={handleAddRow}>
                    <PlusCircleIcon className="h-5 w-5" />
                  </IconButton>
                </Tooltip>
              </td>
            </tr> */}
          </tbody>
              </table>
            </CardBody>

            <CardFooter divider={true}>
              <div className="flex justify-end">
                <Button
                  className="flex items-center gap-3"
                  size="lg"
                  onClick={handleSubmit}
                >
                  Save
                </Button>
              </div>
            </CardFooter>
          </Card>
        </Layout>
      )}
    </>
  );
}
