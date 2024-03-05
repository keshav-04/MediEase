import {
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { PencilIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import {
  Card,
  CardHeader,
  Input,
  Typography,
  Button,
  CardBody,
  CardFooter,
  IconButton,
  Tooltip,
  Select,
  Option,
} from "@material-tailwind/react";

import { useEffect, useState } from "react";
import Pagination from "./Pagination";

export function SortableTable({ tableHead, title, data, detail, text }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginatedData, setPaginatedData] = useState([]);

  const [search, setSearch] = useState("");
  const [searchList, setSearchList] = useState([]);

  const [maxPages, setMaxPages] = useState(
    Math.ceil(data.length / itemsPerPage)
  );

  useEffect(() => {
    setMaxPages(Math.ceil(data.length / itemsPerPage));
  }, [data, itemsPerPage]);

  useEffect(() => {
    const indexOfLastPage = currentPage * itemsPerPage;
    const indexOfFirstPage = indexOfLastPage - itemsPerPage;
    const currentItems = data.slice(
      indexOfFirstPage,
      Math.min(indexOfLastPage, data.length)
    );
    setPaginatedData(currentItems);
    setSearchList(currentItems);
  }, [currentPage, itemsPerPage]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    filterItems(e.target.value);
  };

  const filterItems = (str) => {
    const filteredArray = paginatedData.filter((item) =>
      item.Supplier.toLowerCase().includes(str.toLowerCase())
    );
    setSearchList(filteredArray);
  };

  const paginate = (act) => {
    if (act === "inc") {
      let newPageNum = currentPage + 1;
      if (newPageNum > Math.ceil(data.length / itemsPerPage)) newPageNum = 1;
      setCurrentPage(newPageNum);
    } else {
      let newPageNum = currentPage - 1;
      if (newPageNum < 1) newPageNum = 1;
      setCurrentPage(newPageNum);
    }
  };

  const [sort, setSort] = useState(() => {
    const initialSortState = {};
    Object.keys(tableHead).forEach((key, index) => {
      if (key !== "action") initialSortState[key] = index === 0 ? "asc" : "";
    });
    return initialSortState;
  });

  const sorting = (col) => {
    const sortOrder = sort[col] === "asc" ? -1 : 1;

    if (col === "id") {
      const sorted = [...searchList].sort((a, b) => {
        if (a[col] < b[col]) return sortOrder;
        if (a[col] > b[col]) return -sortOrder;
        return 0;
      });
      setSearchList(sorted);
    } else {
      const sorted = [...searchList].sort((a, b) => {
        if (a[col].toLowerCase() < b[col].toLowerCase()) return sortOrder;
        if (a[col].toLowerCase() > b[col].toLowerCase()) return -sortOrder;
        return 0;
      });
      setSearchList(sorted);
    }
    let newSort = { id: "", Purchase_id: "", date: "", Supplier: "" };
    if (sort[col] === "asc") newSort = { ...newSort, [col]: "dsc" };
    else newSort = { ...newSort, [col]: "asc" };
    setSort(newSort);
  };

  return (
    <Card className="h-full w-full">
      <CardHeader floated={false} shadow={false} className="rounded-none pb-3">
        <div className="mb-2 flex items-center justify-between gap-8">
          <div>
            <Typography variant="h5" color="blue-gray">
              {title}
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              {detail}
            </Typography>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            {/* <Button variant="outlined" size="sm">
            view all
            </Button> */}
            <Button className="flex items-center gap-3" size="sm">
              <UserPlusIcon strokeWidth={2} className="h-4 w-4" /> {text}
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="w-full md:w-72">
            <Input
              label="Search"
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              value={search}
              onChange={(e) => handleSearch(e)}
            />
          </div>
        </div>
      </CardHeader>
      <CardBody className="flex-1 overflow-y-auto px-4 py-1">
        <table className="w-full border table-auto text-left">
          <thead>
            <tr>
              {Object.entries(tableHead).map(([value, head]) => (
                <th
                  key={head}
                  className="cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors hover:bg-blue-gray-50"
                >
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="flex items-center justify-between gap-2 font-bold leading-none"
                  >
                    {head} {""}
                    {value !== "total_amount" &&
                      value !== "action" &&
                      sort[value] === "" && (
                        <div>
                          <ChevronUpDownIcon
                            strokeWidth={2}
                            className="h-5 w-5"
                            onClick={() => sorting(value)}
                          />
                        </div>
                      )}
                    {value !== "total_amount" &&
                      value !== "action" &&
                      sort[value] === "asc" && (
                        <ChevronDownIcon
                          strokeWidth={4}
                          className="h-2.5 w-5"
                          onClick={() => sorting(value)}
                        />
                      )}
                    {value !== "total_amount" &&
                      value !== "action" &&
                      sort[value] === "dsc" && (
                        <ChevronUpIcon
                          strokeWidth={4}
                          className="h-2.5 w-5"
                          onClick={() => sorting(value)}
                        />
                      )}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {searchList.map((rowData) => {
              const classes = "px-3 border-2 opacity-80";
              return (
                <tr className="even:bg-blue-gray-50/50">
                  {Object.entries(tableHead).map(
                    ([key, value]) =>
                      key !== "action" && (
                        <td className={classes}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {rowData[key]}
                          </Typography>
                        </td>
                      )
                  )}
                  <td className={("", classes)}>
                    <Tooltip content="Edit Purcahse">
                      <IconButton variant="text">
                        <PencilIcon className="h-4 w-4" />
                      </IconButton>
                    </Tooltip>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardBody>
      <CardFooter className="min-w-0 flex items-center justify-between border-t border-blue-gray-50 p-3">
        <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          paginate={paginate}
          maxPages={maxPages}
        />
        <div className="md:flex md:flex-row flex-col">
          <Typography color="gray" className="min-w-0 font-normal px-2 mt-2">
            Items per page
          </Typography>
          <div className="">
            <Select
              value={itemsPerPage.toString()}
              onChange={(value) => setItemsPerPage(value)}
            >
              <Option value="10">10</Option>
              <Option value="25">25</Option>
              <Option value="50">50</Option>
              <Option value="100">100</Option>
            </Select>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}