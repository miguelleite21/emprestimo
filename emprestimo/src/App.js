import "./App.css";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import CardInfos from "./components/cardInfos";
import axios from "axios";

const fromSchema = yup.object().shape({
  cpf: yup
    .string()
    .min(11, "Insira um cpf valido")
    .max(11, "Insira um cpf valido")
    .required("CPF obrigatorio"),
  uf: yup.string().required("UF obrigatorio"),
  birthDate: yup.string().required("Data de nascimento obrigatoria"),
  loanAmount: yup.number().required("Valor do emprestimo obrigatorio"),
  installmentValue: yup.number().required("Valor das parcelas obrigatorio"),
});

function App() {
  const [value, setValue] = useState({
    birthDate: "",
    cpf: "",
    installmentValue: 0,
    loanAmount: 0,
    uf: "",
  });

  const [message, setMessage] = useState("");
  const [color, setColor] = useState("");
  const [totalInfos, setTotalInfos] = useState([]);

  const fees = { MG: 1, SP: 0.8, RJ: 0.9, ES: 1.11, "": 0 };

  function loan(data) {
    let month = 0;
    const array = [];

    for (let i = data.loanAmount; i > 0; i) {
      let totalValue = i;
      let feesFunc = (i / 100) * fees[data.uf];

      i += feesFunc;

      const newObject = {
        Ivalue: totalValue,
        fees: feesFunc,
        tvalue: totalValue + feesFunc,
        month: (month += 1),
        totalInterest: totalValue + feesFunc,
      };
      array.push(newObject);

      i -= data.installmentValue;
    }

    return setTotalInfos(array);
  }

  const borrow = (data) => {
    axios
      .post("https://api-emprestimo.herokuapp.com/loans", data)
      .then((e) => {
        setColor("green");
        setMessage(e.data);
      })
      .catch((error) => {
        setColor("red");
        setMessage(error.message);
      });
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(fromSchema) });

  const handleStart = (data) => {
    setValue(data);
    loan(data);
  };

  return (
    <body>
      <h2>Simule e solicite o seu empréstimo.</h2>
      <h4>Preencha o formulário abaixo para simular</h4>

      <form onSubmit={handleSubmit(handleStart)}>
        <input id="cpf" placeholder="CPF" {...register("cpf")} />
        {errors.cpf ? <label for="cpf">{errors.cpf?.message}</label> : ""}
        <select id="uf" placeholder="UF" {...register("uf")}>
          <option value={"SP"}>SP</option>
          <option value={"MG"}>MG</option>
          <option value={"RJ"}>RJ</option>
          <option value={"ES"}>ES</option>
        </select>
        {errors.uf ? <label for="uf">{errors.uf?.message}</label> : ""}
        <input id="birthDate" type="date" {...register("birthDate")} />
        {errors.birthDate ? (
          <label for="birthDate">{errors.birthDate?.message}</label>
        ) : (
          ""
        )}
        <input
          id="loanAmount"
          min={0}
          placeholder="QUAL O VALOR DO EMPRÉSTIMO"
          {...register("loanAmount")}
        />
        {errors.loanAmount ? (
          <label for="loanAmount">Valor do emprestimo obrigatorio</label>
        ) : (
          ""
        )}

        <input
          type="number"
          id="installmentValue"
          min={0}
          placeholder="QUAL VALOR DESEJA PAGAR POR MÊS?"
          {...register("installmentValue")}
        />
        {errors.installmentValue ? (
          <label for="installmentValue">Valor das parcelas obrigatorio</label>
        ) : (
          ""
        )}

        <button type="submit">simular</button>
      </form>

      <h4>Veja a simulação para o seu empréstimo antes de efetivar</h4>
      <div className="divSimulation">
        <div className="infos">
          <CardInfos
            info={"VALOR REQUERIDO:"}
            value={value.loanAmount.toLocaleString("pt-br", {
              style: "currency",
              currency: "BRL",
            })}
          />
          <CardInfos info={"TAXA DE JUROS"} value={`${fees[value.uf]}%`} />
          <CardInfos
            info={"VALOR DA PARCELA"}
            value={value.installmentValue.toLocaleString("pt-br", {
              style: "currency",
              currency: "BRL",
            })}
          />

          <CardInfos
            info={"TOTAL DE MESES PARA QUITAR"}
            value={totalInfos[totalInfos.length - 1]?.month || 0}
          />
          <CardInfos
            info={"TOTAL DE JUROS"}
            value={
              totalInfos[totalInfos.length - 1]
                ? totalInfos[
                    totalInfos.length - 1
                  ]?.totalInterest.toLocaleString("pt-br", {
                    style: "currency",
                    currency: "BRL",
                  })
                : 0
            }
          />
          <CardInfos
            info={"TOTAL A PAGAR"}
            value={
              totalInfos[totalInfos.length - 1]
                ? (
                    totalInfos[totalInfos.length - 1]?.totalInterest +
                    value.loanAmount
                  ).toLocaleString("pt-br", {
                    style: "currency",
                    currency: "BRL",
                  })
                : 0
            }
          />
        </div>
        <h6>PROJEÇÃO DAS PARCELAS:</h6>

        <table>
          <tr>
            <th>SALDO DEVEDOR</th>
            <th>JUROS</th>
            <th>SALDO DEVEDOR AJUSTADO</th>
            <th>VALOR DA PARCELA</th>
          </tr>

          {totalInfos.map((i) => (
            <tr key={i.fees}>
              <td>
                {i.Ivalue.toLocaleString("pt-br", {
                  style: "currency",
                  currency: "BRL",
                })}
              </td>
              <td>
                {i.fees.toLocaleString("pt-br", {
                  style: "currency",
                  currency: "BRL",
                })}
              </td>
              <td>
                {i.tvalue.toLocaleString("pt-br", {
                  style: "currency",
                  currency: "BRL",
                })}
              </td>
              <td>
                {value.installmentValue > i.tvalue
                  ? i.tvalue.toLocaleString("pt-br", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : value.installmentValue.toLocaleString("pt-br", {
                      style: "currency",
                      currency: "BRL",
                    })}
              </td>
            </tr>
          ))}
        </table>
        {totalInfos.length > 0 ? (
          <button onClick={() => borrow(value)}>EFETIVAR O EMPRÉSTIMO ➜</button>
        ) : (
          ""
        )}
        <h4 className={color}>{message}</h4>
      </div>
    </body>
  );
}

export default App;
