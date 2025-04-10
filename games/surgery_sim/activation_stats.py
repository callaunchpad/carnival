import os
import json
import argparse
import torch
import torch.nn.functional as F
import matplotlib.pyplot as plt
import datetime
from utils import load_model
from transformers import AutoModelForCausalLM, AutoTokenizer

timestamp = datetime.datetime.now().strftime("%d%H%M")

device = torch.device("cuda")

class Neuron:
    def __init__(self, layer, neuron, token):
        self.layer = layer
        self.neuron = neuron
        self.token = token
        
def get_activation_stats(model, tokenizer, input_strings, neuron_list_to_steer):
    # Format each input string into a chat-style prompt
    input_formatted_list = []
    for input_string in input_strings:
        input_formatted = [
            {"role": "user", "content": input_string + " Question: ?"},
            {"role": "assistant", "content": "Answer: "}
        ]
        # Assume the tokenizer has a method to apply the chat template
        formatted_input = tokenizer.apply_chat_template(
            input_formatted, tokenize=False, continue_final_message=True
        )
        input_formatted_list.append(formatted_input)
    
    final_list = input_formatted_list
    if not final_list:
        print("No valid inputs to process.")
        return None, None
    print(f"Length of final_list: {len(final_list)}")
    
    # Tokenize the batch (assumes tokenizer returns a dict with 'input_ids', etc.)
    batch = tokenizer(final_list, return_tensors="pt", padding=True)
    # Ensure inputs are on the same device as the model
    device = next(model.parameters()).device
    batch = {k: v.to(device) for k, v in batch.items()}
    
    # Sort the list of neurons for consistency (each neuron should have attributes: layer, neuron, token)
    neuron_list_to_steer = sorted(neuron_list_to_steer, key=lambda x: (x.layer, x.token, x.neuron))
    neuron_activations = {}
    for neuron in neuron_list_to_steer:
        neuron_activations[str(neuron.layer)+'/'+str(neuron.neuron)] = []

    # For a progressive intervention, we gradually add one more neuron each step.
    num_interventions = len(neuron_list_to_steer)
    for k in range(num_interventions + 1):
        # Intervene on the first k neurons in the sorted list.
        current_interventions = neuron_list_to_steer[:k]
        
        # Group interventions by layer; each entry is a list of (neuron_index, token_index)
        interventions_by_layer = {}
        for neuron in current_interventions:
            interventions_by_layer.setdefault(neuron.layer, []).append((neuron.neuron, neuron.token))
        
        # Prepare a list to hold hook handles so we can remove them after the forward pass.
        hooks = []
        
        # Define a factory that creates a hook for a given layer index.
        def get_hook(layer_idx):
            def hook(module, inputs, output):
                # output: tensor of shape (batch, seq_len, hidden_dim)
                if layer_idx in interventions_by_layer:
                    for (n_idx, t_idx) in interventions_by_layer[layer_idx]:
                        # Zero out the activation at the specified token (t_idx) and neuron index (n_idx)
                        # (Assuming t_idx is a valid index in the sequence length)
                        neuron_activations[str(neuron.layer)+'/'+str(neuron.neuron)].append(output[:, t_idx, n_idx])
                return output
            return hook
        
        # Register hooks for each layer that requires intervention.
        for layer_idx in interventions_by_layer.keys():
            # Retrieve the module where interventions should be applied.
            module = model.model.layers[layer_idx].mlp.up_proj
            handle = module.register_forward_hook(get_hook(layer_idx))
            hooks.append(handle)
        
        # Forward pass with the current interventions in place
        model.eval()
        with torch.no_grad():
            intervened_output = model(**batch)
        
        # Remove the hooks to restore original behavior
        for handle in hooks:
            handle.remove()
    
    return neuron_activations

def get_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", type=str, default="/data/huggingface/models--meta-llama--Meta-Llama-3.1-8B-Instruct/snapshots/5206a32e0bd3067aef1ce90f5528ade7d866253f")
    parser.add_argument("--layer-skip", type=int, default=3)
    parser.add_argument("--batch-size", "-bs", type=int, default=10)
    return parser.parse_args()

def plot_results(results_a, results_b, token_a, token_b, ylabel, title):
    x_labels = [str(i) for i in range(len(results_a))]
    plt.figure(figsize=(12, 8))
    
    plt.plot(range(len(results_a)), results_a, marker='o', label=f"Token A ({token_a})")
    plt.plot(range(len(results_b)), results_b, marker='x', label=f"Token B ({token_b})")
    
    for i, (a, b) in enumerate(zip(results_a, results_b)):
        plt.text(i, a.item(), f'{a.item():.2f}', ha='center', va='bottom', fontsize=8)
        plt.text(i, b.item(), f'{b.item():.2f}', ha='center', va='bottom', fontsize=8)
    
    plt.xlabel('Neurons Steered')
    plt.ylabel(ylabel)
    plt.title(title)
    plt.legend()
    plt.xticks(range(len(x_labels)), x_labels)
    plt.grid(True)
    plt.savefig(f'figures/neuron_steer_{ylabel}_{timestamp}.png')
    plt.show()


if __name__ == "__main__":
    args = get_args()
    model, tokenizer = load_model(args)
    model.to(device)

    prompts = ["The ball was passed to ",
               "The final shot was taken by ",
               "With seconds left, the ball was in the hands of ",
               "The MVP of the game was ",
               "The crowd erupted when ",
               "One of the greatest players of all time is ",
               "On the fast break, the ball found "
               "The star player on the court was ",
               "Leading the team in points was ",
               "All eyes were on ",
               "The player who changed the game was ",
               "Known for his clutch performances ",
               "The announcer shouted the name ",
               "He pulled up from three — it's ",
               "She handed the ball off to ",
               "The highlight reel featured ",
               "No one could guard ",
               "In the fourth quarter, they gave the ball to ",
               "At the top of the key stood ",
               "The jersey with number 6 belongs to "
            ]

    for i in prompts:
        inputs = tokenizer.apply_chat_template([{"role" : "user", "content": i}])
        print(inputs)

        input_ids = inputs

        tokens = tokenizer.convert_ids_to_tokens(input_ids)
        token_text_pairs = zip(tokens, input_ids)
        i = 0
        for token, token_id in token_text_pairs:
            print(f"Token {i}: {token}, Token ID: {token_id}")
            i += 1

    # tokens related to harm or inappropriate behavior, specifically those indicating contact or action with minors (e.g., \"mole{{sts}}\", \"molester\", \"sut{{ure}}\", \"congregation\"), and tokens related to detailed physical or surgical terms (e.g., \"rect{{al}}\", \"s{{uture}}\")."
    # neuron_paths = ["meta-llama/Meta-Llama-3.1-8B-Instruct_7_8447_None"]
    # proper nouns related to basketball, particularly "NBA" and variations like "basketball" and "durant" or "lebron"
    neuron_paths = ["meta-llama/Meta-Llama-3.1-8B-Instruct_2_10263_None"]
    neuron_list_to_steer = []
    for neuron_path in neuron_paths:
        layer = neuron_path.split("_")[-3]
        neuron = neuron_path.split("_")[-2]
        neuron_list_to_steer.append(Neuron(layer, neuron, -1))
    
    neuron_activations = get_activation_stats(model, tokenizer, prompts, neuron_paths)
    print(neuron_activations)