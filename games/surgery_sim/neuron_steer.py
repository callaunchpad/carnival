import os
import json
import argparse
import torch
import torch.nn.functional as F
import matplotlib.pyplot as plt
import datetime

timestamp = datetime.datetime.now().strftime("%d%H%M")
from utils import load_model, cache_activations, generate_substitute_layer_single_logits

device = torch.device("cuda")

def stee_token_activations_logits(model_a, tokenizer, input_strings, args_b, token_a, token_b):
    input_formatted_list = []
    for input_string in input_strings:
        input_formatted = [
            {"role": "user", "content": input_string + " Question: ?"},
            {"role": "assistant", "content": "Answer: "}
        ]
        formatted_input = tokenizer.apply_chat_template(
            input_formatted, tokenize=False, continue_final_message=True
        )
        input_formatted_list.append(formatted_input)
    
    final_list = input_formatted_list
    if not final_list:
        print("No valid inputs to process.")
        return
    print(f"Length of final_list: {len(final_list)}")

    layers = list(range(args_b.n_layers))
    module_list_a = [model_a.model.layers[i] for i in layers]

    """ ADD THE STEERING LOGIC """
    
    return log_prob_a_changes, log_prob_b_changes

def get_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", type=str, default="/data/huggingface/models--meta-llama--Meta-Llama-3.1-8B-Instruct/snapshots/5206a32e0bd3067aef1ce90f5528ade7d866253f")
    parser.add_argument("--layer-skip", type=int, default=3)
    parser.add_argument("--batch-size", "-bs", type=int, default=10)
    return parser.parse_args()

def plot_results(log_prob_a_changes, log_prob_b_changes, token_a, token_b):
    x_labels = [str(i) for i in range(len(log_prob_a_changes))]
    plt.figure(figsize=(12, 8))
    
    plt.plot(range(len(log_prob_a_changes)), log_prob_a_changes, marker='o', label=f"Token A ({token_a})")
    plt.plot(range(len(log_prob_b_changes)), log_prob_b_changes, marker='x', label=f"Token B ({token_b})")
    
    for i, (a, b) in enumerate(zip(log_prob_a_changes, log_prob_b_changes)):
        plt.text(i, a.item(), f'{a.item():.2f}', ha='center', va='bottom', fontsize=8)
        plt.text(i, b.item(), f'{b.item():.2f}', ha='center', va='bottom', fontsize=8)
    
    plt.xlabel('Number of Tokens Swapped')
    plt.ylabel('Log Probability')
    plt.title('Log Probability Changes Across Token Swaps')
    plt.legend()
    plt.xticks(range(len(x_labels)), x_labels)
    plt.grid(True)
    plt.savefig(f'../figures/middle_complex_avg_{timestamp}.png')
    plt.show()


if __name__ == "__main__":
    args = get_args()
    model_a, tokenizer = load_model(args)
    model_a.to(device)

    token1 = "hi"
    token2 = "hello"

    prompts = [] 
    
    for i in prompts:
        inputs = tokenizer.apply_chat_template([{"role" : "user", "content": i}, {"role": "assistant", "content": ""}])
        print(inputs)

        input_ids = inputs

        tokens = tokenizer.convert_ids_to_tokens(input_ids)
        token_text_pairs = zip(tokens, input_ids)
        i = 0
        for token, token_id in token_text_pairs:
            print(f"Token {i}: {token}, Token ID: {token_id}")
            i += 1
    
    token_a = tokenizer.convert_tokens_to_ids(f"Ġ{token1}")
    token_b = tokenizer.convert_tokens_to_ids(f"Ġ{token2}")
    
    log_prob_a_changes, log_prob_b_changes = steer_token_activations_logits(
        model_a, tokenizer, prompts, args, token_a, token_b
    )
    
    plot_results(log_prob_a_changes, log_prob_b_changes, token_a, token_b)
